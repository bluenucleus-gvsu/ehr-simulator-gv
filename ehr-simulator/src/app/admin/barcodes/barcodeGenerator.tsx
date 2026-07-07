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
      text: text,
      height: 12,
      includetext: true,
      textxalign: 'center',
    });
  }

  const generateWristbandSvg = (text: string): string => {
    return bwipjs.toSVG({
      bcid: 'datamatrix',
      text: text,
      height: 18,
      width: 18,
    });
  }

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

      let printHTML = '';

      if (isMeds) {
        // --- MEDICATION LABELS HTML ---
        const medsToPrint = medications.filter(med => selectedMeds.includes(med.id));
        const medsWithBarcodes = await Promise.all(medsToPrint.map(async (med) => {
          return { ...med, barcodeDataUrl: generateMedBarcodeSvg(med.id) };
        }));

        printHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Medication Barcodes</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: Arial, sans-serif; padding: 0.5in; background: white; }
              .page-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
              .label-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 15px; width: 100%; }
              .label { border: 1px solid #333; padding: 8px; text-align: center; page-break-inside: avoid; min-height: 120px; display: flex; flex-direction: column; justify-content: space-between; }
              .med-name { font-weight: bold; font-size: 11px; margin-bottom: 2px; }
              .barcode-container { display: flex; justify-content: center; align-items: center; }
              .barcode-container img, .barcode-container svg { max-width: 100%; height: auto; }
              @media print { body { padding: 0.25in; } .label { page-break-inside: avoid; } }
            </style>
          </head>
          <body>
            <div class="page-header">
              <h1>Medication Barcode Labels</h1>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="label-grid">
              ${medsWithBarcodes.map(med => {
          const count = medQuantities[med.id] || 1;
          return Array.from({ length: count }, () => `
                  <div class="label">
                    <div class="med-info">
                      <div class="med-name">${med.genericName} ${med.brandName ? '(' + med.brandName + ')' : ''} ${med.strength}${med.strengthUnit} ${med.route}</div>
                    </div>
                    <div class="barcode-container">${med.barcodeDataUrl}</div>
                  </div>
                `).join('');
        }).join('')}
            </div>
          </body>
          </html>
        `;
      } else {
        // --- WRISTBANDS HTML ---
        const casesToPrint = simCases.filter(c => selectedCases.includes(c.id));
        const casesWithBarcodes = await Promise.all(casesToPrint.map(async (c) => {
          const barcodeContent = '~pt' + c.id
          return { ...c, qrDataUrl: generateWristbandSvg(barcodeContent) };
        }));

        printHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Patient Wristbands</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0.5in; background: white; }
              .page-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
              .wristband-list { display: flex; flex-direction: column; gap: 0.5in; width: 100%; }
              
              /* Wristband Layout */
              .wristband {
                display: flex;
                align-items: center;
                width: 7.5in;
                height: 1.25in;
                border: 1px dashed #999;
                border-radius: 8px;
                padding: 10px 20px;
                page-break-inside: avoid;
                position: relative;
              }
              .band-hole-punch {
                width: 15px;
                height: 15px;
                border-radius: 50%;
                border: 2px solid #ccc;
                position: absolute;
                right: 20px;
              }
              .qr-container {
                margin-right: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .qr-container svg { width: 70px; height: 70px; }
              .divider {
                width: 2px;
                height: 80%;
                background-color: #000;
                margin-right: 20px;
              }
              .patient-info {
                display: flex;
                flex-direction: column;
                justify-content: center;
                flex-grow: 1;
              }
              .patient-name { font-size: 24px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
              .patient-details { font-size: 14px; color: #333; display: flex; gap: 20px; }
              .hospital-branding { font-size: 10px; color: #666; position: absolute; bottom: 8px; right: 50px; text-transform: uppercase; letter-spacing: 1px; }

              @media print { body { padding: 0.25in; } .wristband { page-break-inside: avoid; } }
            </style>
          </head>
          <body>
            <div class="page-header">
              <h1>Patient Wristbands</h1>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="wristband-list">
              ${casesWithBarcodes.map(c => {
          const count = caseQuantities[c.id] || 1;
          return Array.from({ length: count }, () => `
                  <div class="wristband">
                    <div class="qr-container">
                      ${c.qrDataUrl}
                    </div>
                    <div class="divider"></div>
                    <div class="patient-info">
                      <div class="patient-name">${c.first_name} ${c.last_name}</div>
                      <div class="patient-details">
                        <span><strong>ID:</strong> ${c.id}</span>
                      </div>
                    </div>
                    <div class="hospital-branding">GVSU SIM CENTER</div>
                    <div class="band-hole-punch"></div>
                  </div>
                `).join('');
        }).join('')}
            </div>
          </body>
          </html>
        `;
      }

      printWindow.document.write(printHTML);
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
  }

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