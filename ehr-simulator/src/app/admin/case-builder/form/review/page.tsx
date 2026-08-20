"use client"

import { ClipboardCheck, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { publishCase } from "@/actions/case_builder/caseBuilder";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFormContext } from "@/context/FormContext";
import { caseBuilderPath } from "@/lib/caseBuilder/routes";
import { FormShell } from "../../components/formShell";

function displayList(values: string[]): string {
  return values.filter(Boolean).join(", ") || "None";
}

function hasValue(value: unknown): boolean {
  if (value == null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
}

function populatedCount(rows: Record<string | number, unknown>[], offset: number): number {
  return rows.filter((row) => hasValue(row[offset])).length;
}

function Phase({ value }: { value?: number }) {
  return <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">Phase {value ?? 1}</span>;
}

export default function FormReview() {
  const {
    demographicData,
    historyData,
    noteData,
    orderData,
    labData,
    chartingData,
    ioData,
    medOrderData,
    medAdministrationData,
    mediaData,
    caseId,
  } = useFormContext();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!caseId) throw new Error("Complete demographics before publishing the case.");
    await publishCase(caseId);
    router.push(caseBuilderPath("/admin/case-builder/form/success", caseId));
  };

  return (
    <FormShell
      title="Review & Publish Case"
      stepDescription="Confirm all persisted case content, then make the case available for use."
      icon={<ClipboardCheck className="text-slate-400" />}
      onSubmit={handleSubmit}
      goBack={() => router.push(caseBuilderPath("/admin/case-builder/form/media", caseId))}
      continueButtonText="Publish Case"
      backButtonText="Back"
      continueButtonTooltip="Validate and publish this case"
      backButtonTooltip="Return to media"
    >
      <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-5 pb-20">
          <Card>
            <CardHeader className="border-b text-lg font-semibold">Patient and scenario</CardHeader>
            <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
              <p><strong>Name:</strong> {demographicData.firstName} {demographicData.lastName}</p>
              <p><strong>Age / DOB:</strong> {demographicData.age || "None"} / {demographicData.DOBMonth} {demographicData.DOBDay}</p>
              <p><strong>Diagnosis:</strong> {demographicData.admittingDiagnosis || "None"}</p>
              <p><strong>Code status:</strong> {demographicData.codeStatus || "None"}</p>
              <p><strong>Precautions:</strong> {demographicData.precautions || "None"}</p>
              <p><strong>Phases:</strong> {demographicData.phaseCount}</p>
              <p><strong>Provider:</strong> {[demographicData.attendingProviderTitle, demographicData.attendingProviderName].filter(Boolean).join(" ") || "None"}</p>
              <p><strong>Language:</strong> {demographicData.language || "None"}{demographicData.needsInterpreter ? " (interpreter required)" : ""}</p>
              <p><strong>Emergency contact:</strong> {demographicData.contact || "None"}</p>
              <p className="sm:col-span-2 lg:col-span-3"><strong>Summary:</strong> {demographicData.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b text-lg font-semibold">History and safety</CardHeader>
            <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
              <p><strong>Medical:</strong> {displayList(historyData.medicalHistory)}</p>
              <p><strong>Surgical:</strong> {displayList(historyData.surgicalHistory)}</p>
              <p><strong>Allergies:</strong> {displayList(historyData.allergies)}</p>
              <p><strong>Alerts:</strong> {displayList(historyData.alerts)}</p>
              <p><strong>Social:</strong> {displayList(historyData.socialHistory)}</p>
              <p><strong>Living situation:</strong> {displayList(historyData.livingSituation)}</p>
              <p className="sm:col-span-2"><strong>Family:</strong> {historyData.familyHistory.map((entry) => `${entry.relation}: ${entry.condition}`).join(", ") || "None"}</p>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader className="border-b text-lg font-semibold">Clinical notes ({noteData.length})</CardHeader>
              <CardContent className="space-y-3 pt-4">
                {noteData.length === 0 ? <p className="text-slate-500">No notes.</p> : noteData.map((note, index) => (
                  <div key={`${note.title}-${index}`} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2"><strong>{note.title}</strong><Phase value={note.phase} /></div>
                    <p className="text-slate-600">{note.author} · {note.specialty} · {note.timeOffset} min</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="border-b text-lg font-semibold">Orders ({orderData.length})</CardHeader>
              <CardContent className="space-y-3 pt-4">
                {orderData.length === 0 ? <p className="text-slate-500">No orders.</p> : orderData.map((order, index) => (
                  <div key={`${order.title}-${index}`} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2"><strong>{order.title}</strong><Phase value={order.phase} /></div>
                    <p className="text-slate-600">{order.category} · {order.status} · {order.orderingProvider}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader className="border-b text-lg font-semibold">Labs and reports</CardHeader>
              <CardContent className="space-y-2 pt-4">
                {labData.timePoints.map((offset) => (
                  <p key={offset}><strong>{offset} min:</strong> {populatedCount(labData.data as unknown as Record<string | number, unknown>[], offset)} populated results/reports{labData.timePointsInPreSim.has(offset) ? " · Pre-Sim" : ""}</p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="border-b text-lg font-semibold">Charting</CardHeader>
              <CardContent className="space-y-2 pt-4">
                {chartingData.timePoints.map((offset) => (
                  <p key={offset}><strong>{offset} min:</strong> {populatedCount(chartingData.data as unknown as Record<string | number, unknown>[], offset)} populated fields{chartingData.timePointsInPreSim.has(offset) ? " · Pre-Sim" : ""}</p>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="border-b text-lg font-semibold">Intake and output</CardHeader>
            <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {ioData.map((block) => <p key={block.blockId}><strong>Block {block.blockId}:</strong> {block.intake} mL in / {block.output} mL out</p>)}
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader className="border-b text-lg font-semibold">Medication orders ({medOrderData.createdOrders.length})</CardHeader>
              <CardContent className="space-y-3 pt-4">
                {medOrderData.createdOrders.length === 0 ? <p className="text-slate-500">No medication orders.</p> : medOrderData.createdOrders.map((order) => {
                  const medication = medOrderData.selectedMeds.find((item) => item.id === order.medicationId);
                  return <div key={order.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2"><strong>{medication?.genericName ?? "Unknown medication"}</strong><Phase value={order.phase} /></div>
                    <p className="text-slate-600">{order.dose ?? "Variable"} {medication?.strengthUnit} · {order.frequency} · {order.priority}</p>
                  </div>;
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="border-b text-lg font-semibold">Medication administrations ({medAdministrationData.length})</CardHeader>
              <CardContent className="space-y-3 pt-4">
                {medAdministrationData.length === 0 ? <p className="text-slate-500">No administrations.</p> : medAdministrationData.map((administration, index) => (
                  <div key={administration.id ?? index} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2"><strong>{administration.status}</strong><Phase value={administration.phase} /></div>
                    <p className="text-slate-600">{administration.administeredDose} · {administration.adminTimeMinuteOffset} min · {administration.administratorId || "System"}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 border-b text-lg font-semibold"><ImageIcon className="h-5 w-5" /> Media ({mediaData.length})</CardHeader>
            <CardContent className="pt-4">
              {mediaData.length === 0 ? <p className="text-slate-500">No media.</p> : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {mediaData.map((image) => <img key={image.id} src={image.previewUrl} alt="Case media" className="aspect-square w-full rounded-lg border object-contain" />)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </FormShell>
  );
}
