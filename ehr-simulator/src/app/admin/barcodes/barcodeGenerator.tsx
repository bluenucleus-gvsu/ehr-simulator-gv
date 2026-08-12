"use client";

import { useState } from "react";
import bwipjs from "@bwip-js/browser";
import { Checkbox } from "@/components/ui/checkbox";
import { SimCase } from "@/actions/cases";
import { format, differenceInYears } from "date-fns";
import { AllMedicationTypes } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";

interface BarcodeGeneratorProps {
  medications: AllMedicationTypes[];
  simCases: SimCase[];
}

type TabType = "medications" | "wristbands";

// Must match the column count in .label-grid's grid-template-columns for medication labels
const MED_LABEL_COLUMNS = 4;
// Must match the column count in .label-grid's grid-template-columns for patient wristbands
const WRISTBAND_LABEL_COLUMNS = 3;
// Avery 5167: 4 cols x 20 rows. Usable height = 11in - 0.5in top - 0.5in bottom = 10in,
// 10in / 0.5in label height = 20 rows exactly.
const MED_LABEL_ROWS = 20;
// Rows that fit on one 8.5x11in sheet (10.5in usable height / 1in label height = 10)
const WRISTBAND_LABEL_ROWS = 10;

const BardcodeGenerator = ({
  medications,
  simCases,
}: BarcodeGeneratorProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("medications");

  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [medQuantities, setMedQuantities] = useState<Record<string, number>>(
    {},
  );
  const [medStartRow, setMedStartRow] = useState<number>(1);
  const [medStartColumn, setMedStartColumn] = useState<number>(1);

  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [caseQuantities, setCaseQuantities] = useState<Record<string, number>>(
    {},
  );
  const [wristbandStartRow, setWristbandStartRow] = useState<number>(1);
  const [wristbandStartColumn, setWristbandStartColumn] =
    useState<number>(1);

  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const handleMedChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedMeds((prev) => [...prev, id]);
      setMedQuantities((prev) => ({ ...prev, [id]: prev[id] || 1 }));
    } else {
      setSelectedMeds((prev) => prev.filter((medId) => medId !== id));
    }
  };

  const handleMedQuantityChange = (id: string, value: number) => {
    const safeValue = value < 1 || isNaN(value) ? 1 : value;
    setMedQuantities((prev) => ({ ...prev, [id]: safeValue }));
  };

  const handleMedStartRowChange = (value: number) => {
    const safeValue =
      value < 1 || isNaN(value) ? 1 : Math.min(value, MED_LABEL_ROWS);
    setMedStartRow(safeValue);
  };

  const handleMedStartColumnChange = (value: number) => {
    const safeValue =
      value < 1 || isNaN(value)
        ? 1
        : Math.min(value, MED_LABEL_COLUMNS);
    setMedStartColumn(safeValue);
  };

  const handleCaseChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCases((prev) => [...prev, id]);
      setCaseQuantities((prev) => ({ ...prev, [id]: prev[id] || 1 }));
    } else {
      setSelectedCases((prev) => prev.filter((caseId) => caseId !== id));
    }
  };

  const handleCaseQuantityChange = (id: string, value: number) => {
    const safeValue = value < 1 || isNaN(value) ? 1 : value;
    setCaseQuantities((prev) => ({ ...prev, [id]: safeValue }));
  };

  const handleWristbandStartRowChange = (value: number) => {
    const safeValue =
      value < 1 || isNaN(value) ? 1 : Math.min(value, WRISTBAND_LABEL_ROWS);
    setWristbandStartRow(safeValue);
  };

  const handleWristbandStartColumnChange = (value: number) => {
    const safeValue =
      value < 1 || isNaN(value)
        ? 1
        : Math.min(value, WRISTBAND_LABEL_COLUMNS);
    setWristbandStartColumn(safeValue);
  };

  const generateMedBarcodeSvg = (text: string): string => {
    return bwipjs.toSVG({
      bcid: "datamatrix",
      text: text,
      height: 12,
      includetext: true,
      textxalign: "center",
    });
  };

  const generateWristbandSvg = (text: string): string => {
    return bwipjs.toSVG({
      bcid: "datamatrix",
      text: text,
      height: 18,
      width: 18,
    });
  };

  const printItems = async () => {
    const isMeds = activeTab === "medications";
    const selectedIds = isMeds ? selectedMeds : selectedCases;

    if (selectedIds.length === 0) {
      alert(`Please select ${isMeds ? "medications" : "patients"} to print`);
      return;
    }

    setIsPrinting(true);

    try {
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow) {
        alert("Please allow pop-ups to print");
        return;
      }

      let printHTML = "";

      if (isMeds) {
        // --- MEDICATION LABELS HTML ---
        const medsToPrint = medications.filter((med) =>
          selectedMeds.includes(med.id),
        );
        const medsWithBarcodes = await Promise.all(
          medsToPrint.map(async (med) => {
            return { ...med, barcodeDataUrl: generateMedBarcodeSvg(med.id) };
          }),
        );

        printHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Medication Barcodes</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              @page { size: 8.5in 11in; margin: 0; }
              body { font-family: Arial, sans-serif; background: white; }
              .sheet { padding: 0.5in 0.33in 0.5in 0.45in; }
              .label-grid { display: grid; grid-template-columns: repeat(4, 1.75in); column-gap: 0.25in; row-gap: 0; }
              .label { width: 1.75in; height: 0.5in; overflow: hidden; display: flex; flex-direction: row; align-items: center; padding: 1px 3px; gap: 3px; page-break-inside: avoid; }
              .label-text { flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center; padding-right: 3px; padding-left: 3px; }
              .med-name { font-weight: bold; font-size: 5.5pt; line-height: 1.15; overflow: hidden; text-overflow: ellipsis; }
              .med-sub { font-size: 4.5pt; color: #444; line-height: 1.15; }
              .barcode-container { width: 0.42in; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; height: 100%; }
              .barcode-container svg { width: 0.42in; height: 0.38in; }
            </style>
          </head>
          <body>
          <div class="sheet">
            <div class="label-grid">
              ${Array.from(
                {
                  length:
                    (medStartRow - 1) * MED_LABEL_COLUMNS +
                    (medStartColumn - 1),
                },
                () => `<div class="label"></div>`,
              ).join("")}
              ${medsWithBarcodes
                .map((med) => {
                  const count = medQuantities[med.id] || 1;
                  const name = `${med.genericName}${med.brandName ? " (" + med.brandName + ")" : ""}`;
                  const sub = `${med.strength}${med.strengthUnit} [${med.route}]`;
                  return Array.from(
                    { length: count },
                    () => `
            <div class="label">
              <div class="barcode-container">${med.barcodeDataUrl}</div>
              <div class="label-text">
                <div class="med-name">${name}</div>
                <div class="med-sub">${sub}</div>
              </div>
            </div>
          `,
                  ).join("");
                })
                .join("")}
            </div>
          </div>
          </body>
          </html>
        `;
      } else {
        // --- WRISTBANDS HTML ---
        const casesToPrint = simCases.filter((c) =>
          selectedCases.includes(c.id),
        );
        const casesWithBarcodes = await Promise.all(
          casesToPrint.map(async (c) => {
            const barcodeContent = "~pt" + c.id;
            return { ...c, qrDataUrl: generateWristbandSvg(barcodeContent) };
          }),
        );

        printHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Patient Wristbands</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              @page { size: 8.5in 11in; margin: 0; }
              body { font-family: Arial, sans-serif; background: white; }
              .sheet { padding: 0.5in 0.1875in 0 0.1875in; }
              .label-grid { display: grid; grid-template-columns: repeat(3, 2.625in); column-gap: 0.125in; row-gap: 0; }
              .label { width: 2.625in; height: 1in; overflow: hidden; display: flex; flex-direction: row; align-items: center; padding: 4px 6px; gap: 6px; page-break-inside: avoid; }
              .label-barcode { width: 0.75in; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
              .label-barcode svg { width: 0.5in; height: 0.5in; }
              .label-text { flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
              .patient-name { font-weight: bold; font-size: 10pt; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
              .patient-detail { font-size: 7pt; color: #333; line-height: 1.3; }
              .hospital-tag { font-size: 6pt; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
            </style>
          </head>
          <body>
            <div class="sheet">
              <div class="label-grid">
                ${Array.from(
                  {
                    length:
                      (wristbandStartRow - 1) * WRISTBAND_LABEL_COLUMNS +
                      (wristbandStartColumn - 1),
                  },
                  () => `<div class="label"></div>`,
                ).join("")}
                ${casesWithBarcodes
                  .map((c) => {
                    const count = caseQuantities[c.id] || 1;
                    const age = c.date_of_birth
                      ? differenceInYears(new Date(), new Date(c.date_of_birth))
                      : "N/A";
                    return Array.from(
                      { length: count },
                      () => `
                      <div class="label">
                      <div class="label-barcode">${c.qrDataUrl}</div>
                        <div class="label-text">
                          <div class="patient-name">${c.first_name} ${c.last_name}</div>
                          <div class="patient-detail"><strong>DOB:</strong> ${c.date_of_birth || "N/A"}</div>
                          <div class="patient-detail"><strong>Age:</strong> ${age}</div>
                          <div class="patient-detail"><strong>MRN:</strong> ${c.mrn || "12345678"}</div>
                        </div>
                      </div>
                    `,
                    ).join("");
                  })
                  .join("")}
              </div>
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
      console.error("Error generating print payload:", error);
      alert("Error generating print payload. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full">
      <header className="bg-white border-b px-8 pt-6 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              PRINT CENTER
            </h1>
            <p className="text-sm text-gray-500">
              Generate simulator barcodes and patient wristbands
            </p>
          </div>
          <div className="flex items-end gap-3">
            {activeTab === "medications" ? (
              <>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="med-start-row"
                    className="text-sm font-medium text-gray-600"
                  >
                    Start row:
                  </label>
                  <input
                    id="med-start-row"
                    type="number"
                    min="1"
                    max={MED_LABEL_ROWS}
                    className="w-20 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={medStartRow}
                    onChange={(e) =>
                      handleMedStartRowChange(parseInt(e.target.value, 10))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="med-start-column"
                    className="text-sm font-medium text-gray-600"
                  >
                    Start column:
                  </label>
                  <input
                    id="med-start-column"
                    type="number"
                    min="1"
                    max={MED_LABEL_COLUMNS}
                    className="w-20 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={medStartColumn}
                    onChange={(e) =>
                      handleMedStartColumnChange(parseInt(e.target.value, 10))
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="wristband-start-row"
                    className="text-sm font-medium text-gray-600"
                  >
                    Start row:
                  </label>
                  <input
                    id="wristband-start-row"
                    type="number"
                    min="1"
                    max={WRISTBAND_LABEL_ROWS}
                    className="w-20 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={wristbandStartRow}
                    onChange={(e) =>
                      handleWristbandStartRowChange(
                        parseInt(e.target.value, 10),
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="wristband-start-column"
                    className="text-sm font-medium text-gray-600"
                  >
                    Start column:
                  </label>
                  <input
                    id="wristband-start-column"
                    type="number"
                    min="1"
                    max={WRISTBAND_LABEL_COLUMNS}
                    className="w-20 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={wristbandStartColumn}
                    onChange={(e) =>
                      handleWristbandStartColumnChange(
                        parseInt(e.target.value, 10),
                      )
                    }
                  />
                </div>
              </>
            )}
            <button
              onClick={printItems}
              className="bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isPrinting}
            >
              {isPrinting
                ? "Generating..."
                : `Print ${activeTab === "medications" ? "Labels" : "Wristbands"}`}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("medications")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "medications"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Medication Barcodes
          </button>
          <button
            onClick={() => setActiveTab("wristbands")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "wristbands"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Patient Wristbands
          </button>
        </div>
      </header>

      <main className="flex-1 bg-neutral-50 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          {/* MEDICATIONS TAB CONTENT */}
          {activeTab === "medications" &&
            medications.map((med) => {
              const isSelected = selectedMeds.includes(med.id);

              const brandName = med.brandName ? `(${med.brandName})` : "";
              const strengthAndUnit = med.isVariableDose
                ? `variable dose ${med.dispenseUnit}`
                : `${med.strength}${med.strengthUnit} ${med.dispenseUnit}`;
              const route = `[${med.route}]`;

              const medDisplay = `${med.genericName}  ${brandName}  ${strengthAndUnit}  ${route}`;

              // const medDisplay = `${med.generic_name} ${med.brand_name ? '(' + med.brand_name + ')' : ''} ${med.strength}${med.strength_unit} ${med.route}`;

              return (
                <div
                  key={med.id}
                  className="p-4 flex justify-between items-center gap-4 bg-white rounded-xl border shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4 group">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked: boolean) =>
                        handleMedChange(med.id, checked)
                      }
                    />
                    <p className="text-md font-medium text-gray-800">
                      {medDisplay}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor={`med-qty-${med.id}`}
                        className="text-sm font-medium text-gray-600"
                      >
                        Copies:
                      </label>
                      <input
                        id={`med-qty-${med.id}`}
                        type="number"
                        min="1"
                        className="w-20 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={medQuantities[med.id] || 1}
                        onChange={(e) =>
                          handleMedQuantityChange(
                            med.id,
                            parseInt(e.target.value, 10),
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}

          {/* WRISTBANDS TAB CONTENT */}
          {activeTab === "wristbands" &&
            simCases.map((simCase) => {
              const isSelected = selectedCases.includes(simCase.id);

              return (
                <div
                  key={simCase.id}
                  className="p-4 flex justify-between items-center gap-4 bg-white rounded-xl border shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked: boolean) =>
                        handleCaseChange(simCase.id, checked)
                      }
                    />
                    <div className="space-y-1">
                      <p className="text-md font-medium">
                        {simCase.first_name} {simCase.last_name}
                      </p>
                      <p className="text-xs text-gray-700">
                        {simCase.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created on:{" "}
                        {simCase.created_at
                          ? format(simCase.created_at, "P")
                          : "Unknown Date"}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor={`case-qty-${simCase.id}`}
                        className="text-sm font-medium text-gray-600"
                      >
                        Copies:
                      </label>
                      <input
                        id={`case-qty-${simCase.id}`}
                        type="number"
                        min="1"
                        className="w-20 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={caseQuantities[simCase.id] || 1}
                        onChange={(e) =>
                          handleCaseQuantityChange(
                            simCase.id,
                            parseInt(e.target.value, 10),
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}

          {/* Empty States */}
          {activeTab === "medications" && medications.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No medications available.
            </div>
          )}
          {activeTab === "wristbands" && simCases.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No simulation cases available.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BardcodeGenerator;
