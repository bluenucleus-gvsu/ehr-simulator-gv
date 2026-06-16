'use client'

import { useState } from "react";
import bwipjs from '@bwip-js/browser';
import { Checkbox } from "@/components/ui/checkbox";
import { SimCase } from "@/actions/cases";
import { format } from "date-fns";
import { AllMedicationTypes } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";


interface BarcodeGeneratorProps {
  medications: AllMedicationTypes[];
  simCases: SimCase[];
}

type TabType = 'medications' | 'wristbands';

const MEDICATION_LABELS_PER_SHEET = 30;
const WRISTBAND_LABELS_PER_SHEET = 80;

type MedicationWithBarcode = AllMedicationTypes & { barcodeSvg: string };
type CaseWithBarcode = SimCase & { qrSvg: string };

const chunkItems = <T,>(items: T[], chunkSize: number): T[][] => {
  if (items.length === 0) {
    return [];
  }

  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
};

const escapeHtml = (value: string | number | null | undefined): string => {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

const formatPrintableDate = (value: string | null): string => {
  if (!value) {
    return 'N/A';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return format(parsedDate, 'MM/dd/yyyy');
};

const buildMedicationName = (medication: AllMedicationTypes): string => {
  return medication.brandName
    ? `${medication.genericName} (${medication.brandName})`
    : medication.genericName;
};

const buildMedicationDetails = (medication: AllMedicationTypes): string => {
  const strength = medication.isVariableDose
    ? `Variable dose ${medication.dispenseUnit}`
    : `${medication.strength}${medication.strengthUnit} ${medication.dispenseUnit}`.trim();

  return [strength, medication.route].filter(Boolean).join(' • ');
};

const buildCompactPatientName = (simCase: SimCase): string => {
  const fullName = [simCase.last_name, simCase.first_name].filter(Boolean).join(', ').toUpperCase();

  if (fullName.length <= 22) {
    return fullName;
  }

  const firstInitial = simCase.first_name ? `${simCase.first_name.charAt(0)}.` : '';
  return [simCase.last_name, firstInitial].filter(Boolean).join(', ').toUpperCase();
};

const buildMedicationPrintHtml = (
  medications: MedicationWithBarcode[],
  quantities: Record<string, number>,
): string => {
  const expandedLabels = medications.flatMap((medication) =>
    Array.from({ length: quantities[medication.id] || 1 }, (_, copyIndex) => ({
      ...medication,
      copyKey: `${medication.id}-${copyIndex}`,
    })),
  );

  const pages = chunkItems(expandedLabels, MEDICATION_LABELS_PER_SHEET);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medication Barcodes</title>
        <style>
          @page { size: letter; margin: 0; }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #fff; }
          body {
            font-family: Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .sheet {
            width: 8.5in;
            min-height: 11in;
            padding: 0.5in 0.1875in;
            display: grid;
            grid-template-columns: repeat(3, 2.625in);
            grid-auto-rows: 1in;
            column-gap: 0.125in;
            row-gap: 0;
            align-content: start;
            page-break-after: always;
          }
          .sheet:last-child { page-break-after: auto; }
          .label {
            width: 2.625in;
            height: 1in;
            padding: 0.05in;
            overflow: hidden;
            display: grid;
            grid-template-columns: 0.58in 1fr;
            gap: 0.06in;
            align-items: center;
          }
          .label.is-empty { visibility: hidden; }
          .barcode-container {
            width: 0.58in;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .barcode-container svg {
            width: 0.5in;
            height: 0.5in;
            display: block;
          }
          .med-info {
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.03in;
            overflow: hidden;
          }
          .med-name {
            font-size: 8pt;
            line-height: 1.05;
            font-weight: 700;
            max-height: 0.34in;
            overflow: hidden;
          }
          .med-details {
            font-size: 6.5pt;
            line-height: 1.12;
          }
          .med-id {
            font-size: 5.5pt;
            line-height: 1.05;
            color: #555;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        ${pages.map((page) => {
          const emptyLabels = MEDICATION_LABELS_PER_SHEET - page.length;

          return `
            <section class="sheet">
              ${page.map((medication) => `
                <article class="label" data-copy-key="${escapeHtml(medication.copyKey)}">
                  <div class="barcode-container">${medication.barcodeSvg}</div>
                  <div class="med-info">
                    <div class="med-name">${escapeHtml(buildMedicationName(medication))}</div>
                    <div class="med-details">${escapeHtml(buildMedicationDetails(medication))}</div>
                    <div class="med-id">${escapeHtml(medication.id)}</div>
                  </div>
                </article>
              `).join('')}
              ${Array.from({ length: emptyLabels }, () => '<article class="label is-empty" aria-hidden="true"></article>').join('')}
            </section>
          `;
        }).join('')}
      </body>
    </html>
  `;
};

const buildWristbandPrintHtml = (
  simCases: CaseWithBarcode[],
  quantities: Record<string, number>,
): string => {
  const expandedLabels = simCases.flatMap((simCase) =>
    Array.from({ length: quantities[simCase.id] || 1 }, (_, copyIndex) => ({
      ...simCase,
      copyKey: `${simCase.id}-${copyIndex}`,
    })),
  );

  const pages = chunkItems(expandedLabels, WRISTBAND_LABELS_PER_SHEET);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Patient Wristbands</title>
        <style>
          @page { size: letter; margin: 0; }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #fff; }
          body {
            font-family: Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .sheet {
            width: 8.5in;
            min-height: 11in;
            padding: 0.5in 0.75in;
            display: grid;
            grid-template-columns: repeat(4, 1.75in);
            grid-auto-rows: 0.5in;
            gap: 0;
            align-content: start;
            page-break-after: always;
          }
          .sheet:last-child { page-break-after: auto; }
          .wristband-label {
            width: 1.75in;
            height: 0.5in;
            padding: 0.03in 0.04in;
            overflow: hidden;
            display: grid;
            grid-template-columns: 0.34in 1fr;
            gap: 0.04in;
            align-items: center;
          }
          .wristband-label.is-empty { visibility: hidden; }
          .qr-container {
            width: 0.34in;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .qr-container svg {
            width: 0.3in;
            height: 0.3in;
            display: block;
          }
          .patient-info {
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.02in;
          }
          .patient-name {
            font-size: 5.5pt;
            line-height: 1;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .patient-dob {
            font-size: 4.7pt;
            line-height: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        </style>
      </head>
      <body>
        ${pages.map((page) => {
          const emptyLabels = WRISTBAND_LABELS_PER_SHEET - page.length;

          return `
            <section class="sheet">
              ${page.map((simCase) => `
                <article class="wristband-label" data-copy-key="${escapeHtml(simCase.copyKey)}">
                  <div class="qr-container">${simCase.qrSvg}</div>
                  <div class="patient-info">
                    <div class="patient-name">${escapeHtml(buildCompactPatientName(simCase))}</div>
                    <div class="patient-dob">DOB ${escapeHtml(formatPrintableDate(simCase.date_of_birth))}</div>
                  </div>
                </article>
              `).join('')}
              ${Array.from({ length: emptyLabels }, () => '<article class="wristband-label is-empty" aria-hidden="true"></article>').join('')}
            </section>
          `;
        }).join('')}
      </body>
    </html>
  `;
};

const BardcodeGenerator = ({ medications, simCases }: BarcodeGeneratorProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('medications');

  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [medQuantities, setMedQuantities] = useState<Record<string, number>>({});

  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [caseQuantities, setCaseQuantities] = useState<Record<string, number>>({});

  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const handleMedChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedMeds(prev => [...prev, id]);
      setMedQuantities(prev => ({ ...prev, [id]: prev[id] || 1 }));
    } else {
      setSelectedMeds(prev => prev.filter(medId => medId !== id));
    }
  };

  const handleMedQuantityChange = (id: string, value: number) => {
    const safeValue = value < 1 || isNaN(value) ? 1 : value;
    setMedQuantities(prev => ({ ...prev, [id]: safeValue }));
  };

  const handleCaseChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCases(prev => [...prev, id]);
      setCaseQuantities(prev => ({ ...prev, [id]: prev[id] || 1 }));
    } else {
      setSelectedCases(prev => prev.filter(caseId => caseId !== id));
    }
  };

  const handleCaseQuantityChange = (id: string, value: number) => {
    const safeValue = value < 1 || isNaN(value) ? 1 : value;
    setCaseQuantities(prev => ({ ...prev, [id]: safeValue }));
  };

  const generateMedBarcodeSvg = (text: string): string => {
    return bwipjs.toSVG({
      bcid: 'datamatrix',
      text,
      scale: 2,
      paddingwidth: 0,
      paddingheight: 0,
    });
  };

  const generateWristbandSvg = (text: string): string => {
    return bwipjs.toSVG({
      bcid: 'datamatrix',
      text,
      scale: 2,
      paddingwidth: 0,
      paddingheight: 0,
    });
  };

  const printItems = async () => {
    const isMeds = activeTab === 'medications';
    const selectedIds = isMeds ? selectedMeds : selectedCases;

    if (selectedIds.length === 0) {
      alert(`Please select ${isMeds ? 'medications' : 'patients'} to print`);
      return;
    }

    setIsPrinting(true);

    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow pop-ups to print');
        return;
      }

      if (isMeds) {
        const medsToPrint = medications.filter((medication) => selectedMeds.includes(medication.id));
        const medsWithBarcodes: MedicationWithBarcode[] = medsToPrint.map((medication) => ({
          ...medication,
          barcodeSvg: generateMedBarcodeSvg(medication.id),
        }));

        printWindow.document.write(buildMedicationPrintHtml(medsWithBarcodes, medQuantities));
      } else {
        const casesToPrint = simCases.filter((simCase) => selectedCases.includes(simCase.id));
        const casesWithBarcodes: CaseWithBarcode[] = casesToPrint.map((simCase) => ({
          ...simCase,
          qrSvg: generateWristbandSvg(`~pt${simCase.id}`),
        }));

        printWindow.document.write(buildWristbandPrintHtml(casesWithBarcodes, caseQuantities));
      }
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };

    } catch (error) {
      console.error('Error generating print payload:', error);
      alert('Error generating print payload. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full">
      <header className="bg-white border-b px-8 pt-6 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">PRINT CENTER</h1>
            <p className="text-sm text-gray-500">Generate simulator barcodes and patient wristbands</p>
          </div>
          <button
            onClick={printItems}
            className="bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isPrinting}
          >
            {isPrinting ? "Generating..." : `Print ${activeTab === 'medications' ? 'Labels' : 'Wristbands'}`}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('medications')}
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'medications'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Medication Barcodes
          </button>
          <button
            onClick={() => setActiveTab('wristbands')}
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'wristbands'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Patient Wristbands
          </button>
        </div>
      </header>

      <main className="flex-1 bg-neutral-50 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">

          {/* MEDICATIONS TAB CONTENT */}
          {activeTab === 'medications' && medications.map((med) => {
            const isSelected = selectedMeds.includes(med.id);


            const brandName = med.brandName ? `(${med.brandName})` : '';
            const strengthAndUnit = med.isVariableDose ? `variable dose ${med.dispenseUnit}` : `${med.strength}${med.strengthUnit} ${med.dispenseUnit}`
            const route = `[${med.route}]`;

            const medDisplay = `${med.genericName}  ${brandName}  ${strengthAndUnit}  ${route}`;



            // const medDisplay = `${med.generic_name} ${med.brand_name ? '(' + med.brand_name + ')' : ''} ${med.strength}${med.strength_unit} ${med.route}`;

            return (
              <div key={med.id} className="p-4 flex justify-between items-center gap-4 bg-white rounded-xl border shadow-sm transition-all">
                <div className="flex items-center gap-4 group">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked: boolean) => handleMedChange(med.id, checked)}
                  />
                  <p className="text-md font-medium text-gray-800">{medDisplay}</p>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-3">
                    <label htmlFor={`med-qty-${med.id}`} className="text-sm font-medium text-gray-600">
                      Copies:
                    </label>
                    <input
                      id={`med-qty-${med.id}`}
                      type="number"
                      min="1"
                      className="w-20 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={medQuantities[med.id] || 1}
                      onChange={(e) => handleMedQuantityChange(med.id, parseInt(e.target.value, 10))}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* WRISTBANDS TAB CONTENT */}
          {activeTab === 'wristbands' && simCases.map((simCase) => {
            const isSelected = selectedCases.includes(simCase.id);

            return (
              <div key={simCase.id} className="p-4 flex justify-between items-center gap-4 bg-white rounded-xl border shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked: boolean) => handleCaseChange(simCase.id, checked)}
                  />
                  <div className="space-y-1">
                    <p className="text-md font-medium">{simCase.first_name} {simCase.last_name}</p>
                    <p className="text-xs text-gray-700">{simCase.description}</p>
                    <p className="text-xs text-gray-500">Created on: {simCase.created_at ? format(simCase.created_at, 'P') : 'Unknown Date'}</p>

                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-3">
                    <label htmlFor={`case-qty-${simCase.id}`} className="text-sm font-medium text-gray-600">
                      Copies:
                    </label>
                    <input
                      id={`case-qty-${simCase.id}`}
                      type="number"
                      min="1"
                      className="w-20 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={caseQuantities[simCase.id] || 1}
                      onChange={(e) => handleCaseQuantityChange(simCase.id, parseInt(e.target.value, 10))}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty States */}
          {activeTab === 'medications' && medications.length === 0 && (
            <div className="text-center py-10 text-gray-500">No medications available.</div>
          )}
          {activeTab === 'wristbands' && simCases.length === 0 && (
            <div className="text-center py-10 text-gray-500">No simulation cases available.</div>
          )}

        </div>
      </main>
    </div>
  )
}

export default BardcodeGenerator
