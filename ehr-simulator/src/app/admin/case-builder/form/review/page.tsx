'use client'
import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { useFormContext } from "@/context/FormContext"
import { useRouter } from "next/navigation"
import { ClipboardCheck, Stethoscope, Wind, FlaskConical, UserRound, Utensils, ClipboardList } from "lucide-react"
import type { OrderType } from "@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData"
import { FormShell } from "../../components/formShell"
import { saveCaseJsonBlob } from "../../api/dump_case_json"
import { saveCaseData } from "@/actions/case_builder/caseBuilder"
import { CaseSection } from "@/lib/saveCase"
import { ClinicalNote } from "@/app/simulation/[caseId]/[sessionId]/chart/notes/components/notesData"
import type { AllMedicationTypes, MedicationOrder, MedAdministrationInstance} from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData"
import { renderMedFormDetails, renderMedFormTitle } from "../medications/components/medFormHelpers"
import NoteFormDisplay from "../notes/noteFormDisplay";
import type { FamilyHistoryData } from "../history/familyHistory"

const categories: OrderType["category"][] = ["Nursing", "Respiratory", "Laboratory", "Consult", "Diet"]

const getCategoryIcon = (cat: string | undefined) => {
  switch (cat) {
    case "Nursing": return <Stethoscope className="w-4 h-4" />;
    case "Respiratory": return <Wind className="w-4 h-4" />;
    case "Laboratory": return <FlaskConical className="w-4 h-4" />;
    case "Consult": return <UserRound className="w-4 h-4" />;
    case "Diet": return <Utensils className="w-4 h-4" />;
    default: return <ClipboardList className="w-4 h-4" />;
  }
}

const getCategoryColor = (cat: string | undefined) => {
  switch (cat) {
    case "Nursing": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Respiratory": return "bg-cyan-100 text-cyan-700 border-cyan-200";
    case "Laboratory": return "bg-purple-100 text-purple-700 border-purple-200";
    case "Consult": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Diet": return "bg-lime-100 text-lime-700 border-lime-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

const FormReview = () => {
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
    caseId,
    registerCaseBuilderLocalOverlay,
  } = useFormContext()
  const [notes, setNotes] = useState<ClinicalNote[]>(noteData);
  const [familyHistory] = useState<FamilyHistoryData[]>(historyData.familyHistory);

  const router = useRouter();

  useEffect(() => {
    registerCaseBuilderLocalOverlay(null);
    return () => registerCaseBuilderLocalOverlay(null);
  }, [registerCaseBuilderLocalOverlay]);

  const goBack = () => {
    router.push("/admin/case-builder/form/medication-administrations");
  }

  const handleSubmit = async () => {
    try {
      if (caseId) {
        await saveCaseData({
          payload: ioData,
          section: CaseSection.INTAKE_OUTPUT,
          caseId,
        })
      }
      const fullCasePayload = {
        demographics: demographicData,
        history: historyData,
        notes: noteData,
        orders: orderData,
        labs: labData,
        charting: chartingData,
        inputOutput: ioData,
        medicationOrders: medOrderData,
        medicationAdministrations: medAdministrationData
      }
      const title = "Case " + demographicData.firstName + " " + demographicData.lastName;
      await saveCaseJsonBlob(fullCasePayload, title);
      router.push("/admin/case-builder/form/success");
    } catch (error) {
      console.error(error)
      alert("Something went wrong saving the case.")
    };
  }

  const sortedNotes = noteData.sort((a, b) => b.timeOffset - a.timeOffset)

  const getMedicationForOrder = (order: MedicationOrder): AllMedicationTypes | undefined => {
    return medOrderData.selectedMeds.find((med) => med.id === order.medicationId)
  }

  const getOrderForAdmin = (admin: MedAdministrationInstance): MedicationOrder | undefined => {
    return medOrderData.createdOrders.find((med) => med.id === admin.medicationOrderId)
  }

  return (
    <FormShell
      title="Review & Submit Case"
      stepDescription="Review case before submitting"
      icon={<ClipboardCheck className="text-slate-400" />}
      onSubmit={handleSubmit}
      goBack={goBack}
      continueButtonText="Submit Case"
      backButtonText="Back"
      continueButtonTooltip="Proceed to Next Page"
      backButtonTooltip="Return to Previous Page"
    >
      <div className="flex flex-col h-screen w-full bg-slate-50/50 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 h-full max-w-7xl mx-auto pb-20">
            <div className="flex flex-col gap-2">

              <Card>
                <CardHeader className="text-xl font-bold mt-4 border-b-1">Demographics Data</CardHeader>
                <CardContent className="space-y-2 grid grid-cols-2">
                  <p><strong>First Name:</strong> {demographicData.firstName || 'None'}</p>
                  <p><strong>Last Name:</strong> {demographicData.lastName || 'None'}</p>
                  <p><strong>Age:</strong> {demographicData.age || 'None'}</p>
                  <p><strong>DOB:</strong> {demographicData.DOBMonth && demographicData.DOBDay ? `${demographicData.DOBMonth} ${demographicData.DOBDay}` : 'None'}</p>
                  <p><strong>Height (Imperical):</strong> {demographicData.heightFeet && demographicData.heightInches ? `${demographicData.heightFeet}' ${demographicData.heightInches}"` : 'None'}</p>
                  <p><strong>Dosing Weight (Metric):</strong> {demographicData.dosingWeight ? `${demographicData.dosingWeight} kg` : 'None'}</p>
                  <p><strong>Admission Date Offset:</strong> {demographicData.admissionDateOffest || 'None'}</p>
                  <p><strong>Admission Time:</strong> {demographicData.admissionTime || 'None'}</p>
                  <p><strong>Admitting Diagnosis:</strong> {demographicData.admittingDiagnosis || 'None'}</p>
                  <p><strong>Code Status:</strong> {demographicData.codeStatus || 'None'}</p>
                  <p><strong>Precautions:</strong> {demographicData.precautions || 'None'}</p>
                  <p><strong>Provider Name:</strong> {demographicData.attendingProviderTitle || demographicData.attendingProviderName ? `${demographicData.attendingProviderTitle} ${demographicData.attendingProviderName}` : 'None'}</p>
                  <p><strong>Language:</strong> {demographicData.language || 'None'}</p>
                  <p><strong>Needs Interpreter:</strong> {demographicData.needsInterpreter ? 'Yes' : 'No'}</p>
                  <p><strong>Insurance:</strong> {demographicData.insurance || 'None'}</p>
                  <p><strong>Employment:</strong> {demographicData.employment || 'None'}</p>
                  <p><strong>Religion:</strong> {demographicData.religion || 'None'}</p>
                  <p><strong>Relationship Status:</strong> {demographicData.relationshipStatus || 'None'}</p>
                  <p><strong>Emergancy Contact:</strong> {demographicData.contact ? `${demographicData.contact} (${demographicData.contactRelationship || 'None'})` : 'None'}</p>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                  <p><strong>Summary:</strong> {demographicData.summary || 'None'}</p>  
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="text-xl font-bold mt-4 border-b-1">History Data</CardHeader>
                <CardContent className="space-y-2 grid grid-cols-2">
                  <p><strong>Medical History:</strong> {historyData.medicalHistory?.length > 0 ? historyData.medicalHistory.join(', ') : 'None'}</p>
                  <p><strong>Surgical History:</strong> {historyData.surgicalHistory?.length > 0 ? historyData.surgicalHistory.join(', ') : 'None'}</p>
                  <p><strong>Allergies:</strong> {historyData.allergies?.length > 0 ? historyData.allergies.join(', ') : 'None'}</p>
                  <p><strong>Social History:</strong> {historyData.socialHistory?.length > 0 ? historyData.socialHistory.join(', ') : 'None'}</p>
                  <p><strong>Living Situation:</strong> {historyData.livingSituation?.length > 0 ? historyData.livingSituation.join(', ') : 'None'}</p>
                  <p><strong>Alerts:</strong> {historyData.alerts?.length > 0 ? historyData.alerts.join(', ') : 'None'}</p>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                  <p><strong>Family History:</strong> {familyHistory?.length > 0 ? familyHistory.map((entry) => `${entry.relation} (${entry.condition})`).join(', ') : 'None'}</p>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="text-xl font-bold mt-4 border-b-1">Notes Data</CardHeader>
                <CardContent>
                  {sortedNotes.length > 0 ? (
                    sortedNotes.map((note, index) => (
                      <div key={index} className="group relative">
                        <NoteFormDisplay
                          note={note}
                          onDelete={() => setNotes(notes.filter((_, i) => i !== index))}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No Notes Present...</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-xl font-bold mt-4 border-b-1">Orders Data</CardHeader>
                <CardContent>
                  {orderData.length > 0 ? (
                    <div className="space-y-6">
                      {categories.map(cat => {
                        const catOrders = orderData.filter((o: OrderType) => o.category === cat);
                        if (catOrders.length === 0) return null;

                        return (
                          <div key={cat} className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                              {getCategoryIcon(cat)} {cat} Orders
                            </div>

                            <div className="grid gap-0">
                              {catOrders.map((order: OrderType, idx: number) => (
                                <div
                                  key={idx}
                                  className="group relative bg-white first:border-t border-b border-x border-slate-200 first:rounded-t-lg last:rounded-b-lg transition-all flex flex-col md:grid md:grid-cols-13 overflow-hidden"
                                >
                                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getCategoryColor(order.category)}`} />

                                  <div className="md:col-span-2 p-2 pl-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200">
                                    <h4 className="font-medium text-xs text-slate-900 leading-tight">{order.title}</h4>
                                    {order.important && (
                                      <span className="inline-flex w-fit items-center mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-yellow-600 border border-red-100 uppercase tracking-wide">
                                        Important
                                      </span>
                                    )}
                                    {order.visibleInPresim ? (
                                      <span className="inline-flex w-fit items-center mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-lime-50 text-lime-600 border border-lime-100 uppercase tracking-wide">
                                        In Pre-Sim
                                      </span>
                                    ) : (
                                      <span className="inline-flex w-fit items-center mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-100 uppercase tracking-wide">
                                        Not in Pre-Sim
                                      </span>
                                    )}
                                  </div>

                                  <div className="md:col-span-7 p-2 flex items-center md:border-r bg-slate-50/30">
                                    <p className="text-xs tracking-tight text-slate-600 whitespace-pre-wrap">
                                      {order.details || <span className="text-slate-400 italic">No additional details.</span>}
                                    </p>
                                  </div>

                                  <div className="md:col-span-2 p-2 flex items-center justify-center md:border-r">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-slate-700">{order.status}</span>
                                      <span className={`w-2 h-2 rounded-full ring-2 ring-white shadow-sm ${order.status === 'Active' ? 'bg-green-500' : 'bg-amber-400'}`} />
                                    </div>
                                  </div>

                                  <div className="md:col-span-2 p-2 flex items-center justify-between bg-slate-50/50">
                                    <span className="text-xs text-slate-500 font-medium text-wrap" title={order.orderingProvider}>
                                      {order.orderingProvider}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No Orders Present...</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-nowrap font-bold mt-4">Lab Data</CardHeader>
                <CardContent>
                  labData here...
                  {/*JSON.stringify(labData, null, 4)*/}
                </CardContent> 
              </Card>

              <Card>
                <CardHeader className="text-nowrap font-bold mt-4">Charting Data</CardHeader>
                <CardContent>
                  chartingData here...
                  {/*JSON.stringify(chartingData, null, 4)*/}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-nowrap font-bold mt-4">Input-Output Data</CardHeader>
                <CardContent>
                  ioData here..
                  {/*JSON.stringify(ioData, null, 4)*/}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-nowrap font-bold mt-4">Medication Order Data</CardHeader>
                <CardContent>
                  {medOrderData.createdOrders.length > 0 ? (
                    <div className="space-y-4">
                      {medOrderData.createdOrders.map((order) => {
                        const medication = getMedicationForOrder(order)
                        return (
                          <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-col gap-1">
                                {medication ? (
                                  <>
                                    {renderMedFormTitle(medication)}
                                    <div className="text-xs tracking-tight text-slate-600">
                                      {renderMedFormDetails(medication, order)}
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-sm font-semibold text-slate-900">Unknown medication: {order.medicationId}</p>
                                )}
                              </div>

                              <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                                <p><strong>Frequency:</strong> {order.frequency || 'None'}</p>
                                <p><strong>Priority:</strong> {order.priority || 'None'}</p>
                                <p><strong>Indication:</strong> {order.indication || 'None'}</p>
                                <p><strong>Provider:</strong> {order.orderingProvider || 'None'}</p>
                                <p><strong>Dose:</strong> {order.dose ?? 'None'}</p>
                                <p><strong>Visible in Pre-Sim:</strong> {order.visibleInPresim ? 'Yes' : 'No'}</p>
                              </div>

                              {order.instructions ? (
                                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                  <p className="font-medium text-slate-800">Instructions</p>
                                  <p className="whitespace-pre-wrap">{order.instructions}</p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No Medications Present...</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-nowrap font-bold mt-4">Medication Administration Data</CardHeader>
                <CardContent>
                  {medAdministrationData.length > 0 ? 
                  (<div className="space-y-4">
                    {medAdministrationData.map((admin) => {
                      const order = getOrderForAdmin(admin)
                      const medication = order ? getMedicationForOrder(order) : undefined

                      return (
                        <div key={admin.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          {medication ? (
                                  <>
                                    {renderMedFormTitle(medication)}
                                    <div className="text-xs tracking-tight text-slate-600">
                                      {order ? renderMedFormDetails(medication, order) : null}
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-sm font-semibold text-slate-900">Unknown medication: {order ? order.medicationId : null}</p>
                                )}
                                <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                                  <p><strong>Status:</strong> {admin.status}</p>
                                  <p><strong>Administrator:</strong> {admin.administratorId}</p>
                                  <p><strong>Time Offset:</strong> {admin.adminTimeMinuteOffset} min</p>
                                  <p><strong>Administered Dose:</strong> {admin.administeredDose}</p>
                                  <p><strong>Visible in Pre-Sim:</strong> {admin.visibleInPresim ? 'Yes' : 'No'}</p>
                                </div>
                        </div>
                        
                      )
                    })}
                  </div>
                  ) : (
                    <p className="text-gray-500">No Data Present...</p>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </div>
    </FormShell>
  )
}

export default FormReview
