"use client"
import {
  User,
  FileText,
  Briefcase,
  Building2,
  ChevronDown,
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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "@/context/FormContext";
import { relationshipStatuses, precautions, codeStatuses, insuranceOptions, DemographicFormData } from "@/utils/form";
import { buttonVariants } from "@/components/ui/button";
import { FormShell } from "../../components/formShell";
import { CaseSection } from "@/lib/saveCase";
import { saveCaseData } from "@/actions/case_builder/caseBuilder";

import { caseBuilderPath } from "@/lib/caseBuilder/routes";
import { toast } from "sonner";
import { hasText } from "@/lib/caseMinimumRequirements";

export default function DemographicsForm() {
  const { onDataChange, demographicData: initialData, setCaseId, caseId } = useFormContext();
  const [demographicsData, setDemographicsData] = useState<DemographicFormData>(initialData);
  const [missingFields, setMissingFields] = useState<Set<string>>(new Set())
  const router = useRouter();
  const [showCancelAlert, setShowCancelAlert] = useState<boolean>(false);

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

    if (!hasText(demographicsData.summary)) newMissingFields.add('summary');
    if (!hasText(demographicsData.firstName)) newMissingFields.add('firstName');
    if (!hasText(demographicsData.lastName)) newMissingFields.add('lastName');
    if (!hasText(demographicsData.age)) newMissingFields.add('age');
    if (!hasText(demographicsData.codeStatus)) newMissingFields.add('codeStatus');
    if (!hasText(demographicsData.heightInches)) newMissingFields.add('heightInches');
    if (!hasText(demographicsData.heightFeet)) newMissingFields.add('heightFeet');
    if (!hasText(demographicsData.dosingWeight)) newMissingFields.add('dosingWeight');
    if (!hasText(demographicsData.precautions)) newMissingFields.add('precautions');
    if (!hasText(demographicsData.admittingDiagnosis)) newMissingFields.add('admittingDiagnosis');
    if (!hasText(demographicsData.attendingProviderName)) newMissingFields.add('attendingProviderName');
    if (!hasText(demographicsData.attendingProviderTitle)) newMissingFields.add('attendingProviderTitle');

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
    }
    router.push(caseBuilderPath("/admin/case-builder/form/history", result?.id ?? caseId));
  }

  const limits = {
    minAge: 0, maxAge: 120,
    minDay: 1, maxDay: 31,
    minKilograms: 0, maxKilograms: 999,
    minFeet: 0, maxFeet: 8,
    minInches: 0, maxInches: 11,
  }

  const cancelAlert = (
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
      {cancelAlert}
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
                <div className="mt-4 max-w-xs space-y-2">
                  <Label htmlFor="phaseCount">Simulation phases</Label>
                  <Input
                    id="phaseCount"
                    type="number"
                    min={1}
                    max={10}
                    value={demographicsData.phaseCount}
                    onChange={(event) => setDemographicsData({
                      ...demographicsData,
                      phaseCount: Math.min(10, Math.max(1, Number(event.target.value) || 1)),
                    })}
                  />
                  <p className="text-xs text-slate-500">Content assigned to a later phase appears when faculty advance the simulation.</p>
                </div>
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