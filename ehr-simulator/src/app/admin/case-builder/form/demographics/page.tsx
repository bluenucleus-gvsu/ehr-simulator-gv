"use client"
import {
  User,
  FileText,
  Ruler,
  Briefcase,
  Building2,
  Clock,
  ChevronDown,
  Info
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
import InfoTooltip from "../../../../../components/helpTooltip";
import { differenceInYears } from "date-fns";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormContext } from "@/context/FormContext";
import { relationshipStatuses, precautions, months, codeStatuses, days, insuranceOptions, DemographicFormData, intakeOutputBlocksFromCaseRow } from "@/utils/form";
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

export default function DemographicsForm() {
  const { onDataChange, demographicData: initialData, setCaseId, caseId, registerCaseBuilderLocalOverlay } = useFormContext();
  const [demographicsData, setDemographicsData] = useState<DemographicFormData>(initialData);
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
      const bundle = await getCaseBundle(editCaseId);
      const caseRow = bundle.caseRow ?? {};

      const dob = typeof caseRow.date_of_birth === "string" ? caseRow.date_of_birth : "";
      const [, month = "", day = ""] = dob.split("-");
      const monthIdx = Number(month);
      const dobMonth = monthIdx >= 1 && monthIdx <= 12 ? months[monthIdx - 1] : "";
      const dobDay = day ? String(Number(day)) : "";
      let age = "";
      if (dob) {
        const ym = /^(\d{4})-(\d{2})-(\d{2})/.exec(dob.trim());
        if (ym) {
          const y = Number(ym[1]);
          const mo = Number(ym[2]);
          const d = Number(ym[3]);
          if (Number.isFinite(y) && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
            const dobDate = new Date(y, mo - 1, d);
            if (!isNaN(dobDate.getTime())) {
              age = String(differenceInYears(new Date(), dobDate));
            }
          }
        }
      }

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
        DOBDay: dobDay,
        DOBMonth: dobMonth,
        admissionDateOffest: String(caseRow.inpatient_duration_days ?? ""),
        admissionTime: String(caseRow.time_of_admission ?? "").slice(0, 5),
        admittingDiagnosis: caseRow.admitting_diagnosis ?? "",
        age,
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

  const handleSubmit = async () => {
    onDataChange("demographics", demographicsData)
    const result = await saveCaseData({
      payload: demographicsData,
      section: CaseSection.DEMOGRAPHICS,
      caseId: caseId
    });

    if (result?.id) {
      setCaseId(result.id)
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
                <CardDescription>Brief description of the patient scenario.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={demographicsData.summary}
                  onChange={(e) => { setDemographicsData({ ...demographicsData, ["summary"]: e.target.value }) }}
                  required
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
                    Identity
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        required
                        id="firstName"
                        name="firstName"
                        placeholder="Jane"
                        onChange={(e) => { setDemographicsData({ ...demographicsData, ["firstName"]: e.target.value }) }}
                        value={demographicsData.firstName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        required
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        onChange={(e) => { setDemographicsData({ ...demographicsData, ["lastName"]: e.target.value }) }}
                        value={demographicsData.lastName}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Date of Birth</Label>
                      <div className="flex gap-2">
                        <Select
                          required
                          name="DOBMonth"
                          onValueChange={(value) => { setDemographicsData({ ...demographicsData, ["DOBMonth"]: value }) }}
                          value={demographicsData.DOBMonth}
                        >
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Month" />
                            <ChevronDown />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((m, i) => <SelectItem key={i} value={m}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select
                          required
                          name="DOBDay"
                          onValueChange={(value) => { setDemographicsData({ ...demographicsData, ["DOBDay"]: value }) }}
                          value={demographicsData.DOBDay}
                        >
                          <SelectTrigger className="w-[80px] bg-white"><SelectValue placeholder="Day" />
                            <ChevronDown />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map((d, i) => <SelectItem key={i} value={d.toString()}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <div className="relative">
                        <Input
                          onChange={(e) => { if (Number(e.target.value) <= limits.maxAge && (Number(e.target.value) >= limits.minAge)) setDemographicsData({ ...demographicsData, ["age"]: e.target.value }) }}
                          required
                          id="age"
                          name="age"
                          type="number"
                          min={limits.minAge}
                          max={limits.maxAge}
                          className="pr-12"
                          value={demographicsData.age}
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">y.o.</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codeStatus">Code Status</Label>
                    <Select
                      required
                      name="codeStatus"
                      onValueChange={(value) => { setDemographicsData({ ...demographicsData, ["codeStatus"]: value }) }}
                      value={demographicsData.codeStatus}
                    >
                      <SelectTrigger className="bg-white w-fit">
                        <SelectValue placeholder="Select..." />
                        <ChevronDown />

                      </SelectTrigger>
                      <SelectContent>
                        {codeStatuses.map((s, i) => <SelectItem key={i} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-slate-200 shadow-sm pt-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-blue-600" />
                      Physical Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              required
                              name="heightFeet"
                              type="number"
                              min={limits.minFeet}
                              max={limits.maxFeet}
                              className="pr-8"
                              onChange={(e) => { if (Number(e.target.value) <= limits.maxFeet && (Number(e.target.value) >= limits.minFeet)) setDemographicsData({ ...demographicsData, ["heightFeet"]: e.target.value }) }}
                              value={demographicsData.heightFeet}
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400">ft</span>
                          </div>
                          <div className="relative flex-1">
                            <Input
                              required
                              name="heightInches"
                              type="number"
                              min={limits.minInches}
                              max={limits.maxInches}
                              className="pr-8"
                              onChange={(e) => { if (Number(e.target.value) <= limits.maxInches && (Number(e.target.value) >= limits.minInches)) setDemographicsData({ ...demographicsData, ["heightInches"]: e.target.value }) }}
                              value={demographicsData.heightInches}
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400">in</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 w-50">
                        <Label htmlFor="dosingWeight">Dosing Weight</Label>
                        <div className="relative">
                          <Input
                            required
                            id="dosingWeight"
                            name="dosingWeight"
                            type="number"
                            min={limits.minKilograms}
                            max={limits.maxKilograms}
                            className="pr-8"
                            onChange={(e) => { if (Number(e.target.value) <= limits.maxKilograms && (Number(e.target.value) >= limits.minKilograms)) setDemographicsData({ ...demographicsData, ["dosingWeight"]: e.target.value }) }}
                            value={demographicsData.dosingWeight}
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400">kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="precautions">Isolation Precautions</Label>
                      <Select
                        required
                        name="precautions"
                        onValueChange={(value) => { setDemographicsData({ ...demographicsData, ["precautions"]: value }) }}
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
                  </CardContent>
                </Card>

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
              </div>
            </div>

            <Card className="border-slate-200 shadow-sm pt-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Admission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admittingDiagnosis">Admitting Diagnosis</Label>
                  <Input
                    required
                    id="admittingDiagnosis"
                    name="admittingDiagnosis"
                    placeholder="e.g. Acute Appendicitis"
                    onChange={(e) => { setDemographicsData({ ...demographicsData, ["admittingDiagnosis"]: e.target.value }) }}
                    value={demographicsData.admittingDiagnosis}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attending Provider</Label>
                  <div className="flex gap-2">
                    <Select
                      required
                      name="attendingProviderTitle"
                      onValueChange={(value) => { setDemographicsData({ ...demographicsData, ["attendingProviderTitle"]: value }) }}
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
                      onChange={(e) => { setDemographicsData({ ...demographicsData, ["attendingProviderName"]: e.target.value }) }}
                      value={demographicsData.attendingProviderName}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Inpatient Duration
                    <InfoTooltip
                      content="Number of days hospitalized BEFORE simulation start.">
                      <Info size={16} color="var(--muted-foreground)" />
                    </InfoTooltip>
                  </Label>
                  <div className="relative max-w-[180px]">
                    <Input
                      required
                      min={0}
                      name="admissionDateOffest"
                      type="number"
                      className="pr-12"
                      onChange={(e) => { if (Number(e.target.value) <= 99999999 && (Number(e.target.value) >= 0)) setDemographicsData({ ...demographicsData, ["admissionDateOffest"]: e.target.value }) }}
                      value={demographicsData.admissionDateOffest}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">days</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admissionTime">Time of Admission</Label>
                  <div className="relative max-w-[180px]">
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <Input
                      required
                      name="admissionTime"
                      id="admissionTime"
                      type="time"
                      className="pl-10"
                      onChange={(e) => { setDemographicsData({ ...demographicsData, ["admissionTime"]: e.target.value }) }}
                      value={demographicsData.admissionTime}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientContact">Emergency Contact</Label>
                  <Input
                    required
                    name="patientContact"
                    id="patientContact"
                    placeholder="First & Last Name"
                    className=""
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
    </FormShell>
  )
}
