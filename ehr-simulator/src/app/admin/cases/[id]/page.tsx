"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ChevronDown, FolderPen, TriangleAlert } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import { type CaseDataRow, type CaseDataScalarUpdate, type CaseFamilyHistoryRow, type CodeStatusType, type InsuranceType } from "../types"
import {
  getSimCaseById, updateSimCase,
  getIsolationPrecautions, getRelationshipStatuses, getRelationshipTypes, getSafetyAlerts,
  replaceFamilyHistory, getCoursesForCase,
  addSafetyAlert, removeSafetyAlert,
  type LookupRow,
} from "@/actions/cases"
import MultiTextInput, { type MultiTextInputHandle } from "../../case-builder/components/multiTextInput"
import { EditFamilyHistory } from "../components/EditFamilyHistory"
import Link from "next/link"

// Section wrapper
const FormSection = ({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) => (
  <Card className="border-slate-200 shadow-sm">
    <div className="flex items-baseline gap-3 px-4 py-0">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
    </div>
    <CardContent className="px-4 py-0">
      {children}
    </CardContent>
  </Card>
)

// Warning that editing the case affects any course that it is assigned to
const MultipleCourseWarning = ({ courses }: { courses: string[] }) => (
  <Card className="border-red-400 bg-red-50 shadow-sm">
    <CardContent className="px-4 py-1 flex items-center gap-3">
      <TriangleAlert color="#9f0712" />
      <div>
        <p className="text-sm font-semibold text-red-800">
          This case is assigned to multiple courses. Editing it will affect all of them.
        </p>
        <p className="text-xs text-red-700 mt-0.5">
          This case is assigned to the following courses:{' '}
          <span className="font-bold">{courses.join(', ')}</span>.
          To edit the case without affecting those courses, make a copy of this case and edit the copy instead.
        </p>
      </div>
    </CardContent>
  </Card>
)

export default function CasePage() {
  // Editing the patient's demographics and history are handled on this main page
  // Editing the more complex parts of the case (eg. notes, labs, meds) are handled in subpages 

  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string

  const [formData, setFormData] = useState<CaseDataRow | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const initialRow = useRef<CaseDataRow | null>(null)
  const [assignedCourses, setAssignedCourses] = useState<string[]>([])

  const [isolationOptions, setIsolationOptions] = useState<LookupRow[]>([])
  const [relationshipStatusOptions, setRelationshipStatusOptions] = useState<LookupRow[]>([])
  const [relationshipTypeOptions, setRelationshipTypeOptions] = useState<LookupRow[]>([])
  const [safetyAlertOptions, setSafetyAlertOptions] = useState<LookupRow[]>([])

  const medicalHistoryRef = useRef<MultiTextInputHandle>(null)
  const surgicalHistoryRef = useRef<MultiTextInputHandle>(null)
  const allergiesRef = useRef<MultiTextInputHandle>(null)
  const socialHabitsRef = useRef<MultiTextInputHandle>(null)
  const livingSituationRef = useRef<MultiTextInputHandle>(null)

  const editPageRoutes: { label: string, href: string }[] = [
    // { label: "Note Entries", href: "notes" },
    // { label: "Order Entries", href: "orders" },
    // { label: "Lab Results", href: "labs" },
    // { label: "Charts", href: "charting" },
    // { label: "Intake & Output", href: "intake-output" },
    // { label: "Medications", href: "medications" },
    // { label: "Medication Administrations", href: "medication-administrations" },
    { label: "Note Entries", href: "notes" },
    { label: "Order Entries", href: "orders" },
    { label: "Lab Results", href: "labs" },
    { label: "Charts", href: "#" },
    { label: "Intake & Output", href: "#" },
    { label: "Medications", href: "#" },
    { label: "Medication Administrations", href: "#" },
  ]

  // Unfinished pages aren't linked to, their buttons are grayed out
  const EditPageButton = ({ label, href }: { label: string; href: string }) => (
    <Link href={`/admin/cases/${caseId}/${href}`}>
      <Button variant={`${href === "#" ? "secondary" : "outline"}`} className="w-full cursor-pointer">
        {label}
      </Button>
    </Link>
  )

  useEffect(() => {
    const fetchAll = async () => {
      const [caseResult, isolationResult, relStatusResult, relTypeResult, safetyResult, coursesResult] = await Promise.all([
        // Get the case details
        getSimCaseById(caseId),

        // Get options for select fields
        getIsolationPrecautions(),
        getRelationshipStatuses(),
        getRelationshipTypes(),
        getSafetyAlerts(),

        // Get the courses that the case is assigned to
        getCoursesForCase(caseId),
      ])

      if (caseResult.success && caseResult.data) {
        const row = caseResult.data as CaseDataRow
        initialRow.current = row
        setFormData(row)
      } else {
        console.error("Failed to fetch case data:", caseResult.error)
        setLoadError("Failed to load case. Please try again.")
      }

      if (isolationResult.success && isolationResult.data) setIsolationOptions(isolationResult.data)
      if (relStatusResult.success && relStatusResult.data) setRelationshipStatusOptions(relStatusResult.data)
      if (relTypeResult.success && relTypeResult.data) setRelationshipTypeOptions(relTypeResult.data)
      if (safetyResult.success && safetyResult.data) setSafetyAlertOptions(safetyResult.data)

      if (coursesResult.success && coursesResult.data) {
        setAssignedCourses(coursesResult.data.courseNames)
      }
    }
    fetchAll()
  }, [caseId])

  const updateField = <K extends keyof CaseDataScalarUpdate>(
    field: K,
    value: CaseDataScalarUpdate[K]
  ) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : prev)
  }

  const arrayDebounceRef = useRef<Partial<Record<keyof CaseDataScalarUpdate, ReturnType<typeof setTimeout>>>>({})

  const updateArrayField = useCallback(<K extends keyof Pick<CaseDataRow, 'medical_history' | 'surgical_history' | 'allergies' | 'social_habits' | 'living_situation'>>(
    field: K,
    value: string[]
  ) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : prev)
    clearTimeout(arrayDebounceRef.current[field])
    arrayDebounceRef.current[field] = setTimeout(() => {
      updateCaseData({ [field]: value } as CaseDataScalarUpdate)
    }, 1000)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateCaseData = async (payload: CaseDataScalarUpdate) => {
    const result = await updateSimCase(caseId, payload)
    if (!result.success) {
      console.error("Failed to update case:", result.error)
    }
  }

  const handleFamilyHistoryAdd = async (entry: { relationship_id: string; condition: string }) => {
    const newRow: CaseFamilyHistoryRow = {
      id: crypto.randomUUID(),
      case_id: caseId,
      relationship_id: entry.relationship_id,
      condition: entry.condition,
      created_at: new Date().toISOString(),
    }
    setFormData(prev => prev ? {
      ...prev,
      case_family_history: [...(prev.case_family_history ?? []), newRow]
    } : prev)
    await replaceFamilyHistory(caseId, [
      ...(formData?.case_family_history ?? []).map(r => ({
        relationship_id: r.relationship_id,
        condition: r.condition,
      })),
      entry,
    ])
  }

  const handleFamilyHistoryDelete = async (id: string) => {
    const updated = (formData?.case_family_history ?? []).filter(r => r.id !== id)
    setFormData(prev => prev ? { ...prev, case_family_history: updated } : prev)
    await replaceFamilyHistory(caseId, updated.map(r => ({
      relationship_id: r.relationship_id,
      condition: r.condition,
    })))
  }

  // Update db when safety alert is toggled
  const handleSafetyAlertToggle = async (safetyAlertId: string, checked: boolean) => {
    if (!formData) return
    if (checked) {
      await addSafetyAlert(caseId, safetyAlertId)
      setFormData(prev => prev ? {
        ...prev,
        case_safety_alerts: [...(prev.case_safety_alerts ?? []), {
          case_id: caseId,
          safety_alert_id: safetyAlertId,
          created_at: new Date().toISOString(),
        }]
      } : prev)
    } else {
      await removeSafetyAlert(caseId, safetyAlertId)
      setFormData(prev => prev ? {
        ...prev,
        case_safety_alerts: (prev.case_safety_alerts ?? []).filter(a => a.safety_alert_id !== safetyAlertId)
      } : prev)
    }
  }

  // Update db when leaving form field after editing entry
  const handleBlur = <K extends keyof CaseDataScalarUpdate>(field: K) => {
    if (!formData || !initialRow.current) return
    if (formData[field] !== initialRow.current[field]) {
      updateCaseData({ [field]: formData[field] } as CaseDataScalarUpdate)
      // Keep initialRow in sync so repeated blurs don't re-fire
      initialRow.current = { ...initialRow.current, [field]: formData[field] }
    }
  }

  // Display error or loading message
  if (loadError) return <div className="p-8 text-red-500">{loadError}</div>
  if (!formData) return <div className="p-8 text-slate-500">Loading...</div>

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50/50">

      {/* Header */}
      <header className="sticky top-0 flex items-center justify-between px-4 sm:px-8 py-3 bg-white border-b z-10 shadow gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FolderPen className="text-slate-400" /> Modify Case
          </h1>
          <p className="text-xs text-slate-500 mt-1">View and edit case details</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button className="cursor-pointer" onClick={() => { router.push("/admin/cases") }}>
            <ArrowLeft />Return to Cases
          </Button>
        </div>
      </header>

      <div className="flex-1 p-3 sm:p-4 md:px-6 lg:px-12 bg-slate-50/50">
        <div className="max-w-7xl mx-auto space-y-3 pb-10">

          {/* Warn when case is assigned to multiple courses */}
          {assignedCourses.length > 1 && <MultipleCourseWarning courses={assignedCourses} />}

          {/* --- Form sections start here --- */}

          {/* Case Info */}
          <FormSection title="Case Info" subtitle="General case identifiers and clinical context">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

              {/* Case name */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Case Name</Label>
                <Input
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                />
              </div>

              {/* Case description */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Description</Label>
                <Input
                  value={formData.description ?? ''}
                  onChange={e => updateField('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                />
              </div>

              {/* Admitting diagnosis */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Admitting Diagnosis</Label>
                <Input
                  value={formData.admitting_diagnosis ?? ''}
                  onChange={e => updateField('admitting_diagnosis', e.target.value)}
                  onBlur={() => handleBlur('admitting_diagnosis')}
                />
              </div>

              {/* Attending provider */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Attending Provider</Label>
                <Input
                  value={formData.attending_provider ?? ''}
                  onChange={e => updateField('attending_provider', e.target.value)}
                  onBlur={() => handleBlur('attending_provider')}
                />
              </div>

              {/* Code status */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Code Status</Label>
                <Select
                  value={formData.code_status}
                  onValueChange={val => {
                    updateField('code_status', val as CodeStatusType)
                    updateCaseData({ code_status: val as CodeStatusType })
                  }}
                >
                  <SelectTrigger><SelectValue /><ChevronDown /></SelectTrigger>
                  <SelectContent>
                    {(['Full', 'DNR', 'Partial'] as CodeStatusType[]).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time of Admission */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Time of Admission</Label>
                <Input
                  type="time"
                  value={formData.time_of_admission ?? ''}
                  onChange={e => updateField('time_of_admission', e.target.value)}
                  onBlur={() => handleBlur('time_of_admission')}
                />
              </div>

              {/* Inpatient duration */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Inpatient Duration (days)</Label>
                <Input
                  type="number"
                  value={formData.inpatient_duration_days ?? ''}
                  onChange={e => updateField('inpatient_duration_days', Number(e.target.value))}
                  onBlur={() => handleBlur('inpatient_duration_days')}
                />
              </div>
            </div>
          </FormSection>

          {/*  Demographics  */}
          <FormSection title="Demographics" subtitle="Patient identity and personal background">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

              {/* First name */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">First Name</Label>
                <Input
                  value={formData.first_name}
                  onChange={e => updateField('first_name', e.target.value)}
                  onBlur={() => handleBlur('first_name')}
                />
              </div>

              {/* Last name */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Last Name</Label>
                <Input
                  value={formData.last_name}
                  onChange={e => updateField('last_name', e.target.value)}
                  onBlur={() => handleBlur('last_name')}
                />
              </div>

              {/* DOB */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth ?? ''}
                  onChange={e => updateField('date_of_birth', e.target.value)}
                  onBlur={() => handleBlur('date_of_birth')}
                />
              </div>

              {/* Language */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Language</Label>
                <Input
                  value={formData.language ?? ''}
                  onChange={e => updateField('language', e.target.value)}
                  onBlur={() => handleBlur('language')}
                />
              </div>

              {/* Religion */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Religion</Label>
                <Input
                  value={formData.religion ?? ''}
                  onChange={e => updateField('religion', e.target.value)}
                  onBlur={() => handleBlur('religion')}
                />
              </div>

              {/* Insurance */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Insurance</Label>
                <Select
                  value={formData.insurance ?? 'none'}
                  onValueChange={val => {
                    const v = val === 'none' ? null : val as InsuranceType
                    updateField('insurance', v)
                    updateCaseData({ insurance: v })
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="None" /><ChevronDown /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {(['Medicare', 'Medicaid', 'Private'] as InsuranceType[]).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employment */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Employment</Label>
                <Input
                  value={formData.employment ?? ''}
                  placeholder="Occupation"
                  onChange={e => updateField('employment', e.target.value)}
                  onBlur={() => handleBlur('employment')}
                />
              </div>

              {/* Height */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Height</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="ft"
                    value={formData.height_ft ?? ''}
                    onChange={e => updateField('height_ft', Number(e.target.value))}
                    onBlur={() => handleBlur('height_ft')}
                  />
                  <Input
                    type="number"
                    placeholder="in"
                    value={formData.height_in ?? ''}
                    onChange={e => updateField('height_in', Number(e.target.value))}
                    onBlur={() => handleBlur('height_in')}
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Weight</Label>
                <Input
                  type="number"
                  placeholder="kg"
                  value={formData.weight_kg ?? ''}
                  onChange={e => updateField('weight_kg', Number(e.target.value))}
                  onBlur={() => handleBlur('weight_kg')}
                />
              </div>

              {/* Req interpreter */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Requires Interpreter</Label>
                <div className="flex items-center h-9">
                  <Switch
                    checked={formData.requires_interpreter}
                    onCheckedChange={val => {
                      updateField('requires_interpreter', val)
                      updateCaseData({ requires_interpreter: val })
                    }}
                  />
                </div>
              </div>

              {/* Relationship Status */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Relationship Status</Label>
                <Select
                  value={formData.relationship_status_id ?? 'none'}
                  onValueChange={val => {
                    const v = val === 'none' ? null : val
                    updateField('relationship_status_id', v)
                    updateCaseData({ relationship_status_id: v })
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="None" /><ChevronDown /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {relationshipStatusOptions.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Isolation Precautions */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Isolation Precautions</Label>
                <Select
                  value={formData.isolation_precautions_id ?? 'none'}
                  onValueChange={val => {
                    const v = val === 'none' ? null : val
                    updateField('isolation_precautions_id', v)
                    updateCaseData({ isolation_precautions_id: v })
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="None" /><ChevronDown /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {isolationOptions.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Emergency Contact Name */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Emergency Contact Name</Label>
                <Input
                  value={formData.emergency_contact_name ?? ''}
                  onChange={e => updateField('emergency_contact_name', e.target.value)}
                  onBlur={() => handleBlur('emergency_contact_name')}
                />
              </div>

              {/* Emergency Contact Relationship */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Emergency Contact Relationship</Label>
                <Input
                  value={formData.emergency_contact_relationship ?? ''}
                  onChange={e => updateField('emergency_contact_relationship', e.target.value)}
                  onBlur={() => handleBlur('emergency_contact_relationship')}
                />
              </div>
            </div>
          </FormSection>

          {/* Clinical Profile */}
          <FormSection title="Clinical Profile" subtitle="Past medical and surgical events">

            {/* Medical hx */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MultiTextInput
                ref={medicalHistoryRef}
                labelText="Medical History"
                value={formData.medical_history ?? []}
                onChange={val => updateArrayField('medical_history', val)}
                placeholder="e.g. HTN, GERD..."
                emptyMessage="No diagnoses recorded."
              />

              {/* Surgical hx */}
              <MultiTextInput
                ref={surgicalHistoryRef}
                labelText="Surgical History"
                value={formData.surgical_history ?? []}
                onChange={val => updateArrayField('surgical_history', val)}
                placeholder="e.g. TAVR (2010)..."
                emptyMessage="No procedures recorded."
              />

              {/* Allergies */}
              <MultiTextInput
                ref={allergiesRef}
                labelText="Allergies"
                value={formData.allergies ?? []}
                onChange={val => updateArrayField('allergies', val)}
                placeholder="e.g. Penicillin..."
                emptyMessage="No allergens recorded."
              />
            </div>
          </FormSection>

          {/* Social & Environmental */}
          <FormSection title="Social & Environmental" subtitle="Living situation and habits">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Social habits */}
              <MultiTextInput
                ref={socialHabitsRef}
                labelText="Social Habits"
                value={formData.social_habits ?? []}
                onChange={val => updateArrayField('social_habits', val)}
                placeholder="e.g. Tobacco Use, High Risk Occupation..."
                emptyMessage="No social habits recorded."
              />

              {/* Living situation */}
              <MultiTextInput
                ref={livingSituationRef}
                labelText="Living Situation"
                value={formData.living_situation ?? []}
                onChange={val => updateArrayField('living_situation', val)}
                placeholder="e.g. Lives alone, Group Home..."
                emptyMessage="No living situations recorded."
              />
            </div>
          </FormSection>

          {/* Family History */}
          <FormSection title="Family History">
            <EditFamilyHistory
              rows={formData.case_family_history ?? []}
              relationshipOptions={relationshipTypeOptions}
              onAdd={handleFamilyHistoryAdd}
              onDelete={handleFamilyHistoryDelete}
            />
          </FormSection>

          {/* Safety Alerts */}
          <FormSection title="Safety Alerts" subtitle="Active alerts associated with this patient">
            <div className="flex flex-wrap gap-4 py-2">
              {safetyAlertOptions.map(alert => {
                const isActive = (formData.case_safety_alerts ?? []).some(a => a.safety_alert_id === alert.id)
                return (
                  <div key={alert.id} className="flex items-center gap-2">
                    <Switch
                      id={`alert-${alert.id}`}
                      checked={isActive}
                      onCheckedChange={checked => handleSafetyAlertToggle(alert.id, checked)}
                    />
                    <Label htmlFor={`alert-${alert.id}`} className="text-xs text-slate-600">{alert.name}</Label>
                  </div>
                )
              })}
            </div>
          </FormSection>

          {/* Links to other parts of case */}
          <Card className="border-slate-200 shadow-sm">
            <div className="flex items-baseline gap-3 px-4 py-0">
              <p className="text-sm font-semibold text-slate-800">View & Edit More...</p>
            </div>
            <CardContent className="px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {editPageRoutes.map(({ label, href }, key) => (
                <EditPageButton key={key} label={label} href={href} />
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}