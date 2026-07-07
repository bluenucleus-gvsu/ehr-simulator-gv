"use client"
import {
  User,
  FileText,
  Briefcase,
  Building2,
  ChevronDown
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormContext } from "@/context/FormContext";
import { relationshipStatuses, precautions, codeStatuses, insuranceOptions, DemographicFormData, intakeOutputBlocksFromCaseRow } from "@/utils/form";
import { buttonVariants } from "@/components/ui/button";
import { FormShell } from "../../components/formShell";
import { CaseSection } from "@/lib/saveCase";
import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { getCaseBundle } from "@/actions/case_builder/getCase";
import { labTemplate } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { buildLabRowsFromBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsFromBundle";
import { medOrderFormStateFromCaseBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marFromBundle";
import { flexSheetTemplate } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";
import { buildChartingRowsFromBundle } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/chartingFromBundle";
import { isTesterModeClient } from "@/utils/testerMode";
import { getTesterCaseDraft, setTesterCaseDraft, upsertTesterCase } from "@/utils/testerLocalStore";
import { toast } from "sonner";

export default function DemographicsForm() {
  const { onDataChange, demographicData: initialData, setCaseId, caseId, registerCaseBuilderLocalOverlay } = useFormContext();
  const [demographicsData, setDemographicsData] = useState<DemographicFormData>(initialData);
  const [missingFields, setMissingFields] = useState<Set<string>>(new Set())
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCancelAlert, setShowCancelAlert] = useState<boolean>(false);

  useEffect(() => {
    registerCaseBuilderLocalOverlay(() => ({ demographics: demographicsData }));
    return () => registerCaseBuilderLocalOverlay(null);
  }, [demographicsData, registerCaseBuilderLocalOverlay]);

  useEffect(() => {
    const editCaseId = searchParams.get("caseId");
    if (!editCaseId || editCaseId === caseId) return;

    const loadCaseForEditing = async () => {
      if (isTesterModeClient()) {
        const ensureSet = <T,>(value: unknown, mapper?: (v: unknown) => T | null): Set<T> => {
          if (value instanceof Set) return value as Set<T>;
          if (!Array.isArray(value)) return new Set<T>();
          const mapped = mapper
            ? value.map(mapper).filter((v): v is T => v !== null)
            : (value as T[]);
          return new Set(mapped);
        };

        const localDraft = getTesterCaseDraft<{
          demographics?: DemographicFormData;
          history?: any;
          notes?: any[];
          orders?: any[];
          labs?: { data?: any[]; timePoints?: number[]; timePointsInPreSim?: unknown; visibleItems?: unknown };
          charting?: { data?: any[]; timePoints?: number[]; timePointsInPreSim?: unknown; visibleItems?: unknown };
          intakeOutput?: any[];
          medOrders?: any;
          medAdministrationInstances?: any[];
        }>(editCaseId);
        if (localDraft) {
          if (localDraft.demographics) {
            onDataChange("demographics", localDraft.demographics);
            setDemographicsData(localDraft.demographics);
          }
          if (localDraft.history) onDataChange("history", localDraft.history);
          if (localDraft.notes) onDataChange("notes", localDraft.notes);
          if (localDraft.orders) onDataChange("orders", localDraft.orders);
          if (localDraft.labs) {
            onDataChange("labs", {
              ...localDraft.labs,
              timePointsInPreSim: ensureSet<number>(
                localDraft.labs.timePointsInPreSim,
                (v) => {
                  const num = Number(v);
                  return Number.isFinite(num) ? num : null;
                },
              ),
              visibleItems: ensureSet<string>(
                localDraft.labs.visibleItems,
                (v) => (typeof v === "string" ? v : null),
              ),
            } as any);
          }
          if (localDraft.charting) {
            onDataChange("charting", {
              ...localDraft.charting,
              timePointsInPreSim: ensureSet<number>(
                localDraft.charting.timePointsInPreSim,
                (v) => {
                  const num = Number(v);
                  return Number.isFinite(num) ? num : null;
                },
              ),
              visibleItems: ensureSet<string>(
                localDraft.charting.visibleItems,
                (v) => (typeof v === "string" ? v : null),
              ),
            } as any);
          }
          if (localDraft.intakeOutput) onDataChange("intakeOutput", localDraft.intakeOutput);
          if (localDraft.medOrders) onDataChange("medOrders", localDraft.medOrders);
          if (localDraft.medAdministrationInstances) {
            onDataChange("medAdministrationInstances", localDraft.medAdministrationInstances);
          }
          setCaseId(editCaseId);
          return;
        }
      }

      const bundle = await getCaseBundle(editCaseId);
      const caseRow = bundle.caseRow ?? {};

      const providerRaw = String(caseRow.attending_provider ?? "").trim();
      const providerTokens = providerRaw.split(/\s+/).filter(Boolean);
      const titles = new Set(["MD", "DO", "NP", "PA"]);
      let attendingProviderTitle = "";
      let attendingProviderName = providerRaw;
      if (providerTokens.length > 1) {
        const first = providerTokens[0] ?? "";
        const last = providerTokens[providerTokens.length - 1] ?? "";
        if (titles.has(first)) {
          attendingProviderTitle = first;
          attendingProviderName = providerTokens.slice(1).join(" ");
        } else if (titles.has(last)) {
          attendingProviderTitle = last;
          attendingProviderName = providerTokens.slice(0, -1).join(" ");
        }
      }

      const mappedDemographics: DemographicFormData = {
        admittingDiagnosis: caseRow.admitting_diagnosis ?? "",
        age: caseRow.age,
        attendingProviderName,
        attendingProviderTitle,
        codeStatus: caseRow.code_status ?? "",
        dosingWeight: String(caseRow.weight_kg ?? ""),
        employment: caseRow.employment ?? "",
        firstName: caseRow.first_name ?? "",
        heightFeet: String(caseRow.height_ft ?? ""),
        heightInches: String(caseRow.height_in ?? ""),
        insurance: caseRow.insurance ?? "",
        language: caseRow.language ?? "",
        needsInterpreter: Boolean(caseRow.requires_interpreter),
        lastName: caseRow.last_name ?? "",
        precautions: caseRow.isolation_precautions?.name ?? "",
        relationshipStatus: caseRow.relationship_status?.name ?? "",
        religion: caseRow.religion ?? "",
        summary: caseRow.description ?? "",
        contact: caseRow.emergency_contact_name ?? "",
        contactRelationship: caseRow.emergency_contact_relationship ?? "",
        contactPhone: caseRow.emergency_contact_phone ?? "",
      };

      onDataChange("demographics", mappedDemographics);
      setDemographicsData(mappedDemographics);

      onDataChange("history", {
        medicalHistory: caseRow.medical_history ?? [],
        surgicalHistory: caseRow.surgical_history ?? [],
        allergies: caseRow.allergies ?? [],
        socialHistory: caseRow.social_habits ?? [],
        livingSituation: caseRow.living_situation ?? [],
        alerts: (bundle.safetyAlerts ?? []).map((x: any) => x?.safety_alert?.name).filter(Boolean),
        familyHistory: (bundle.familyHistory ?? []).map((x: any) => ({
          relation: x?.relationship?.name ?? "",
          condition: x?.condition ?? "",
        })).filter((x: { relation: string; condition: string }) => x.relation && x.condition),
      });

      onDataChange("notes", (bundle.clinicalDocuments ?? []).map((n: any) => ({
        title: `${n.category ?? "Progress"} Note`,
        author: n.author ?? "",
        specialty: n.specialty ?? "",
        timeOffset: Number(n.time_offset ?? 0),
        excludedFromPresim: !Boolean(n.is_in_presim),
        content: n.doc_text ?? "<p></p>",
      })));

      onDataChange("orders", (bundle.orders ?? []).map((o: any) => ({
        category: o.category,
        title: o.title ?? "",
        details: o.details ?? "",
        status: o.status ?? "Active",
        orderingProvider: o.provider ?? "",
        important: Boolean(o.is_important),
        visibleInPresim: Boolean(o.is_in_presim),
      })));

      const hydratedLabs = buildLabRowsFromBundle(
        {
          labResults: bundle.labResults ?? [],
          imagingReports: bundle.imagingReports ?? [],
          microbiologyReports: bundle.microbiologyReports ?? [],
        },
        labTemplate,
      );
      onDataChange("labs", {
        data: hydratedLabs.rows,
        timePoints: hydratedLabs.timePoints,
        timePointsInPreSim: new Set(
          (bundle.labResults ?? [])
            .filter((row: any) => Boolean(row?.is_in_presim))
            .map((row: any) => Number(row?.time_offset))
            .filter((offset: number) => Number.isFinite(offset)),
        ),
        visibleItems: new Set(
          hydratedLabs.rows
            .filter((row) => row.hideable)
            .map((row) => row.field),
        ),
      });

      const hydratedCharting = buildChartingRowsFromBundle(bundle.documentationResults ?? [], flexSheetTemplate);
      onDataChange("charting", {
        data: hydratedCharting.rows,
        timePoints: hydratedCharting.timeOffsets,
        timePointsInPreSim: hydratedCharting.timePointsInPreSim,
        visibleItems: hydratedCharting.visibleItems,
      });

      onDataChange(
        "intakeOutput",
        intakeOutputBlocksFromCaseRow(bundle.caseRow?.intake_output_blocks),
      );

      onDataChange("medOrders", medOrderFormStateFromCaseBundle(bundle));

      onDataChange("medAdministrationInstances", (bundle.medicationAdministrations ?? []).map((m: any) => ({
        id: m.id,
        medicationOrderId: String(m.medication_order_id ?? m.medication_id ?? ""),
        administratorId: m.administrator ?? "",
        adminTimeMinuteOffset: Number(m.time_offset ?? 0),
        status: m.status ?? "Due",
        notes: m.notes ?? "",
        administeredDose: Number(m.administered_dose ?? 0),
        visibleInPresim: Boolean(m.is_in_presim),
      })));

      setCaseId(editCaseId);
    };

    void loadCaseForEditing();
  }, [searchParams, caseId, onDataChange, setCaseId]);

  const goBack = () => {
    setShowCancelAlert(true);
  }

  const handleCancelConfirm = () => {
    setShowCancelAlert(false);
    router.push("/admin/");
  }

  const handleCancelDismiss = () => {
    setShowCancelAlert(false);
  }

  const validateDemographics = () => {
    const newMissingFields = new Set<string>();

    if (!demographicsData.summary) newMissingFields.add('summary');
    if (!demographicsData.firstName) newMissingFields.add('firstName');
    if (!demographicsData.lastName) newMissingFields.add('lastName');
    if (!demographicsData.age) newMissingFields.add('age');
    if (!demographicsData.codeStatus) newMissingFields.add('codeStatus');
    if (!demographicsData.heightInches) newMissingFields.add('heightInches');
    if (!demographicsData.heightFeet) newMissingFields.add('heightFeet');
    if (!demographicsData.dosingWeight) newMissingFields.add('dosingWeight');
    if (!demographicsData.precautions) newMissingFields.add('precautions');
    if (!demographicsData.admittingDiagnosis) newMissingFields.add('admittingDiagnosis');
    if (!demographicsData.attendingProviderName) newMissingFields.add('attendingProviderName');
    if (!demographicsData.attendingProviderTitle) newMissingFields.add('attendingProviderTitle');

    setMissingFields(newMissingFields);

    return newMissingFields
  };

  const clearMissingField = (field: string, value: string) => {
    if (missingFields.has(field) && value.trim() !== "") {
      setMissingFields((prev) => {
        const updatedFields = new Set(prev);
        updatedFields.delete(field);
        return updatedFields;
      });
    }
  };

  const handleSubmit = async () => {
    const currentMissingFields = validateDemographics()
    if (currentMissingFields.size > 0) {
      toast.warning('Missing required fields')
      return
    }
    onDataChange("demographics", demographicsData)
    const result = await saveCaseData({
      payload: demographicsData,
      section: CaseSection.DEMOGRAPHICS,
      caseId: caseId
    });

    if (result?.id) {
      setCaseId(result.id)
      if (isTesterModeClient()) {
        upsertTesterCase({
          id: result.id,
          name: `${demographicsData.firstName ?? ""} ${demographicsData.lastName ?? ""}`.trim(),
          first_name: demographicsData.firstName ?? "",
          last_name: demographicsData.lastName ?? "",
          description: demographicsData.summary ?? "",
          admitting_diagnosis: demographicsData.admittingDiagnosis ?? "",
        })
        setTesterCaseDraft(result.id, { demographics: demographicsData })
      }
    }
    router.push("/admin/case-builder/form/history");
  }

  const limits = {
    minAge: 0, maxAge: 120,
    minDay: 1, maxDay: 31,
    minKilograms: 0, maxKilograms: 999,
    minFeet: 0, maxFeet: 8,
    minInches: 0, maxInches: 11,
  }

  const CancelAlert = () => (
    <AlertDialog
      open={showCancelAlert}
      onOpenChange={setShowCancelAlert}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Confirm Cancellation
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to discard this case? Your changes won&apos;t be saved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="cursor-pointer"
            onClick={handleCancelDismiss}>
            Keep Editing
          </AlertDialogCancel>
          <AlertDialogAction
            className={`${buttonVariants({ variant: "destructive" })} cursor-pointer`}
            onClick={handleCancelConfirm}>
            Cancel Case Creation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <FormShell
      title="Patient Demographics"
      icon={<User className="text-slate-400" />}
      stepDescription="Step 1 of 10: Basic identification and admission details"
      onSubmit={handleSubmit}
      goBack={goBack}
      continueButtonText="Continue"
      backButtonText="Cancel"
      continueButtonTooltip="Proceed to Next Page"
      backButtonTooltip="Quit & Return to Dashboard"
    >
      <CancelAlert />
      <div className="flex overflow-y-auto flex-col w-full bg-slate-50/50">
        <div className="flex-1 p-6 md:px-12 lg:px-24">
          <div className="max-w-6xl mx-auto space-y-6 pb-20">

            <Card className="border-slate-200 shadow-sm pt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Case Overview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <CardDescription>Brief description of the patient scenario.</CardDescription>
                  {missingFields.has('summary') && <p className="text-red-600 text-sm">(Required)</p>}
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={demographicsData.summary}
                  onChange={(e) => { setDemographicsData({ ...demographicsData, ["summary"]: e.target.value }) }}
                  name="summary"
                  placeholder="e.g. 68-year-old male admitted with shortness of breath..."
                  className="min-h-[100px] bg-white"
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">

              <Card className="border-slate-200 shadow-sm h-fit pt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Identity & Physical Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        {missingFields.has('firstName') && <p className="text-red-600 text-sm">(Required)</p>}
                      </div>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Jane"
                        onChange={(e) => {
                          setDemographicsData({ ...demographicsData, ["firstName"]: e.target.value })
                          clearMissingField("firstName", e.target.value);
                        }}
                        value={demographicsData.firstName}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        {missingFields.has('lastName') && <p className="text-red-600 text-sm">(Required)</p>}
                      </div>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        onChange={(e) => {
                          setDemographicsData({ ...demographicsData, ["lastName"]: e.target.value })
                          clearMissingField("lastName", e.target.value);
                        }}
                        value={demographicsData.lastName}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Label htmlFor="age">Age</Label>
                        {missingFields.has('age') && <p className="text-red-600 text-sm">(Required)</p>}
                      </div>
                      <div className="relative">
                        <Input
                          onChange={(e) => {
                            if (Number(e.target.value) <= limits.maxAge && (Number(e.target.value) >= limits.minAge)) {
                              setDemographicsData({ ...demographicsData, ["age"]: e.target.value })
                              clearMissingField("age", e.target.value);

                            }
                          }}
                          required
                          id="age"
                          name="age"
                          min={limits.minAge}
                          max={limits.maxAge}
                          className="pr-12"
                          value={demographicsData.age}
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">y.o.</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Label htmlFor="codeStatus">Code Status</Label>
                        {missingFields.has('codeStatus') && <p className="text-red-600 text-sm">(Required)</p>}
                      </div>
                      <Select
                        required
                        name="codeStatus"
                        onValueChange={(value) => {
                          setDemographicsData({ ...demographicsData, ["codeStatus"]: value })
                          clearMissingField("codeStatus", value);

                        }}
                        value={demographicsData.codeStatus}
                      >
                        <SelectTrigger className="bg-white w-full">
                          <SelectValue placeholder="Select..." />
                          <ChevronDown />
                        </SelectTrigger>
                        <SelectContent>
                          {codeStatuses.map((s, i) => <SelectItem key={i} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Label>Height</Label>
                        {(missingFields.has('heightFeet') || missingFields.has('heightInches')) && <p className="text-red-600 text-sm">(Required)</p>}
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            required
                            name="heightFeet"
                            min={limits.minFeet}
                            max={limits.maxFeet}
                            className="pr-8"
                            onChange={(e) => {
                              if (Number(e.target.value) <= limits.maxFeet && (Number(e.target.value) >= limits.minFeet)) {
                                setDemographicsData({ ...demographicsData, ["heightFeet"]: e.target.value })
                                clearMissingField("heightFeet", e.target.value);
                              }
                            }}
                            value={demographicsData.heightFeet}
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400">ft</span>
                        </div>
                        <div className="relative flex-1">
                          <Input
                            required
                            name="heightInches"
                            min={limits.minInches}
                            max={limits.maxInches}
                            className="pr-8"
                            onChange={(e) => {
                              if (Number(e.target.value) <= limits.maxInches && (Number(e.target.value) >= limits.minInches)) {
                                setDemographicsData({ ...demographicsData, ["heightInches"]: e.target.value })
                                clearMissingField("heightInches", e.target.value);
                              }
                            }}
                            value={demographicsData.heightInches}
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400">in</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Label htmlFor="dosingWeight">Dosing Weight</Label>
                        {missingFields.has('dosingWeight') && <p className="text-red-600 text-sm">(Required)</p>}
                      </div>
                      <div className="relative">
                        <Input
                          required
                          id="dosingWeight"
                          name="dosingWeight"
                          min={limits.minKilograms}
                          max={limits.maxKilograms}
                          className="pr-8"
                          onChange={(e) => {
                            if (Number(e.target.value) <= limits.maxKilograms && (Number(e.target.value) >= limits.minKilograms)) {
                              setDemographicsData({ ...demographicsData, ["dosingWeight"]: e.target.value })
                              clearMissingField("dosingWeight", e.target.value);
                            }
                          }}
                          value={demographicsData.dosingWeight}
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">kg</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Label htmlFor="precautions">Isolation Precautions</Label>
                        {missingFields.has('precautions') && <p className="text-red-600 text-sm whitespace-nowrap">(Required)</p>}
                      </div>
                      <Select
                        required
                        name="precautions"
                        onValueChange={(value) => {
                          setDemographicsData({ ...demographicsData, ["precautions"]: value })
                          clearMissingField("precautions", value);
                        }}
                        value={demographicsData.precautions}
                      >
                        <SelectTrigger className="bg-white min-w-50">
                          <SelectValue placeholder="Select..." />
                          <ChevronDown />
                        </SelectTrigger>
                        <SelectContent>
                          {precautions.map((p, i) => <SelectItem key={i} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* SOCIAL CONTEXT CARD */}
              <Card className="border-slate-200 shadow-sm pt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Social Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input
                        required
                        id="language"
                        name="language"
                        placeholder="e.g. English"
                        onChange={(e) => { setDemographicsData({ ...demographicsData, ["language"]: e.target.value }) }}
                        value={demographicsData.language}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurance">Insurance</Label>
                      <Select
                        required
                        name="insurance"
                        onValueChange={(value) => { setDemographicsData({ ...demographicsData, ["insurance"]: value }) }}
                        value={demographicsData.insurance}
                      >
                        <SelectTrigger className="bg-white min-w-50">
                          <SelectValue placeholder="Select..." />
                          <ChevronDown />
                        </SelectTrigger>
                        <SelectContent>
                          {insuranceOptions.map((o, i) => <SelectItem key={i} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employment">Employment</Label>
                      <Input
                        required
                        id="employment"
                        name="employment"
                        placeholder="Occupation"
                        onChange={(e) => { setDemographicsData({ ...demographicsData, ["employment"]: e.target.value }) }}
                        value={demographicsData.employment}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationshipStatus">Relationship</Label>
                      <Select
                        required
                        name="relationshipStatus"
                        onValueChange={(value) => { setDemographicsData({ ...demographicsData, ["relationshipStatus"]: value }) }}
                        value={demographicsData.relationshipStatus}
                      >
                        <SelectTrigger className="bg-white min-w-50">
                          <SelectValue placeholder="Select..." />
                          <ChevronDown />
                        </SelectTrigger>
                        <SelectContent>
                          {relationshipStatuses.map((s, i) => <SelectItem key={i} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="religion">Religion</Label>
                      <Input
                        required
                        id="religion"
                        name="religion"
                        placeholder=""
                        onChange={(e) => { setDemographicsData({ ...demographicsData, ["religion"]: e.target.value }) }}
                        value={demographicsData.religion}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Checkbox
                        id="needsInterpreter"
                        name="needsInterpreter"
                        defaultChecked={false}
                        onCheckedChange={(value) => { setDemographicsData({ ...demographicsData, ["needsInterpreter"]: typeof value === 'boolean' ? value : false }) }}
                        checked={demographicsData.needsInterpreter}
                      />
                      <Label htmlFor="needsInterpreter" className="font-normal text-slate-600">Needs Interpreter</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ADMISSION DETAILS CARD */}
              <Card className="border-slate-200 shadow-sm pt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Admission Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Label htmlFor="admittingDiagnosis">Admitting Diagnosis</Label>
                      {missingFields.has('admittingDiagnosis') && <p className="text-red-600 text-sm">(Required)</p>}
                    </div>
                    <Input
                      required
                      id="admittingDiagnosis"
                      name="admittingDiagnosis"
                      placeholder="e.g. Acute Appendicitis"
                      onChange={(e) => {
                        setDemographicsData({ ...demographicsData, ["admittingDiagnosis"]: e.target.value })
                        clearMissingField('admittingDiagnosis', e.target.value)
                      }}
                      value={demographicsData.admittingDiagnosis}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Label>Attending Provider</Label>
                      {(missingFields.has('attendingProviderTitle') || missingFields.has('attendingProviderName')) && <p className="text-red-600 text-sm">(Required)</p>}
                    </div>
                    <div className="flex gap-2">
                      <Select
                        required
                        name="attendingProviderTitle"
                        onValueChange={(value) => {
                          setDemographicsData({ ...demographicsData, ["attendingProviderTitle"]: value })
                          clearMissingField('attendingProviderTitle', value)
                        }}
                        value={demographicsData.attendingProviderTitle}
                      >
                        <SelectTrigger className="bg-white w-fit">
                          <SelectValue placeholder="Title" />
                          <ChevronDown />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MD">MD</SelectItem>
                          <SelectItem value="DO">DO</SelectItem>
                          <SelectItem value="NP">NP</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        required
                        name="attendingProviderName"
                        placeholder="First & Last Name"
                        className="flex-1"
                        onChange={(e) => {
                          setDemographicsData({ ...demographicsData, ["attendingProviderName"]: e.target.value })
                          clearMissingField('attendingProviderName', e.target.value)
                        }}
                        value={demographicsData.attendingProviderName}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientContact">Patient Contact</Label>
                    <Input
                      required
                      name="patientContact"
                      id="patientContact"
                      placeholder="First & Last Name"
                      onChange={(e) => { setDemographicsData({ ...demographicsData, ["contact"]: e.target.value }) }}
                      value={demographicsData.contact}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactRelationship">Contact Relationship</Label>
                    <Input
                      required
                      name="contactRelationship"
                      id="contactRelationship"
                      onChange={(e) => { setDemographicsData({ ...demographicsData, ["contactRelationship"]: e.target.value }) }}
                      value={demographicsData.contactRelationship}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact phone</Label>
                    <Input
                      name="contactPhone"
                      id="contactPhone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="e.g. (555) 123-4567"
                      onChange={(e) => { setDemographicsData({ ...demographicsData, contactPhone: e.target.value }) }}
                      value={demographicsData.contactPhone}
                    />
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </FormShell>
  )
}