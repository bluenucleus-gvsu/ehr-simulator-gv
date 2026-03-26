"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, FolderPen } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect, useRef, useCallback } from "react"
import { type CaseDataRow, type CaseDataScalarUpdate, type CaseFamilyHistoryRow, type CodeStatusType, type InsuranceType } from "../types"
import {
  getSimCaseById, updateSimCase,
  getIsolationPrecautions, getRelationshipStatuses, getRelationshipTypes, getSafetyAlerts,
  replaceFamilyHistory,
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

export default function CasePage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string

  const [formData, setFormData] = useState<CaseDataRow | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const initialRow = useRef<CaseDataRow | null>(null)

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
    { label: "Note Entries", href: "notes" },
    { label: "Order Entries", href: "orders" },
    { label: "Lab Results", href: "labs" },
    { label: "Charts", href: "charting" },
    { label: "Intake & Output", href: "intake-output" },
    { label: "Medications", href: "medications" },
    { label: "Medication Administrations", href: "medication-administrations" },
  ]

  useEffect(() => {
    const fetchAll = async () => {
      const [caseResult, isolationResult, relStatusResult, relTypeResult, safetyResult] = await Promise.all([
        getSimCaseById(caseId),
        getIsolationPrecautions(),
        getRelationshipStatuses(),
        getRelationshipTypes(),
        getSafetyAlerts(),
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

  const handleBlur = <K extends keyof CaseDataScalarUpdate>(field: K) => {
    if (!formData || !initialRow.current) return
    if (formData[field] !== initialRow.current[field]) {
      updateCaseData({ [field]: formData[field] } as CaseDataScalarUpdate)
      // Keep initialRow in sync so repeated blurs don't re-fire
      initialRow.current = { ...initialRow.current, [field]: formData[field] }
    }
  }

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
            Return to Cases <ArrowRight />
          </Button>
        </div>
      </header>

      <div className="flex-1 p-3 sm:p-4 md:px-6 lg:px-12 bg-slate-50/50">
        <div className="max-w-7xl mx-auto space-y-3 pb-10">

          {/* Case Info */}
          <FormSection title="Case Info" subtitle="General case identifiers and clinical context">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Case Name</Label>
                <Input
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Description</Label>
                <Input
                  value={formData.description ?? ''}
                  onChange={e => updateField('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Admitting Diagnosis</Label>
                <Input
                  value={formData.admitting_diagnosis ?? ''}
                  onChange={e => updateField('admitting_diagnosis', e.target.value)}
                  onBlur={() => handleBlur('admitting_diagnosis')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Attending Provider</Label>
                <Input
                  value={formData.attending_provider ?? ''}
                  onChange={e => updateField('attending_provider', e.target.value)}
                  onBlur={() => handleBlur('attending_provider')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Code Status</Label>
                <Select
                  value={formData.code_status}
                  onValueChange={val => {
                    updateField('code_status', val as CodeStatusType)
                    updateCaseData({ code_status: val as CodeStatusType })
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['Full', 'DNR', 'Partial'] as CodeStatusType[]).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Time of Admission</Label>
                <Input
                  type="time"
                  value={formData.time_of_admission ?? ''}
                  onChange={e => updateField('time_of_admission', e.target.value)}
                  onBlur={() => handleBlur('time_of_admission')}
                />
              </div>
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
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">First Name</Label>
                <Input
                  value={formData.first_name}
                  onChange={e => updateField('first_name', e.target.value)}
                  onBlur={() => handleBlur('first_name')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Last Name</Label>
                <Input
                  value={formData.last_name}
                  onChange={e => updateField('last_name', e.target.value)}
                  onBlur={() => handleBlur('last_name')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth ?? ''}
                  onChange={e => updateField('date_of_birth', e.target.value)}
                  onBlur={() => handleBlur('date_of_birth')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Language</Label>
                <Input
                  value={formData.language ?? ''}
                  onChange={e => updateField('language', e.target.value)}
                  onBlur={() => handleBlur('language')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Religion</Label>
                <Input
                  value={formData.religion ?? ''}
                  onChange={e => updateField('religion', e.target.value)}
                  onBlur={() => handleBlur('religion')}
                />
              </div>
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
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {(['Medicare', 'Medicaid', 'Private'] as InsuranceType[]).map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Employment</Label>
                <Input
                  value={formData.employment ?? ''}
                  placeholder="Occupation"
                  onChange={e => updateField('employment', e.target.value)}
                  onBlur={() => handleBlur('employment')}
                />
              </div>
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
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {relationshipStatusOptions.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {isolationOptions.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-slate-500">Emergency Contact Name</Label>
                <Input
                  value={formData.emergency_contact_name ?? ''}
                  onChange={e => updateField('emergency_contact_name', e.target.value)}
                  onBlur={() => handleBlur('emergency_contact_name')}
                />
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MultiTextInput
                ref={medicalHistoryRef}
                labelText="Medical History"
                value={formData.medical_history ?? []}
                onChange={val => updateArrayField('medical_history', val)}
                placeholder="e.g. HTN, GERD..."
                emptyMessage="No diagnoses recorded."
              />
              <MultiTextInput
                ref={surgicalHistoryRef}
                labelText="Surgical History"
                value={formData.surgical_history ?? []}
                onChange={val => updateArrayField('surgical_history', val)}
                placeholder="e.g. TAVR (2010)..."
                emptyMessage="No procedures recorded."
              />
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
              <MultiTextInput
                ref={socialHabitsRef}
                labelText="Social Habits"
                value={formData.social_habits ?? []}
                onChange={val => updateArrayField('social_habits', val)}
                placeholder="e.g. Tobacco Use, High Risk Occupation..."
                emptyMessage="No social habits recorded."
              />
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

          <Card className="border-slate-200 shadow-sm">
            <div className="flex items-baseline gap-3 px-4 py-0">
              <p className="text-sm font-semibold text-slate-800">Edit More...</p>
            </div>
            <CardContent className="px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {editPageRoutes.map(({ label, href }) => (
                <Link key={href} href={`/admin/cases/${caseId}/${href}`}>
                  <Button variant="outline" className="w-full cursor-pointer">
                    {label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}