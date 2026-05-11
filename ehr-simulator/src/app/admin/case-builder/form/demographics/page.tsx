"use client"
import {
  User,
  FileText,
  Ruler,
  Briefcase,
  Building2,
  Clock,
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
import InfoTooltip from "../../components/helpTooltip";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "@/context/FormContext";
import { relationshipStatuses, precautions, months, codeStatuses, days, insuranceOptions, DemographicFormData } from "@/utils/form";
import { buttonVariants } from "@/components/ui/button";
import { FormShell } from "../../components/formShell";
import { CaseSection } from "@/lib/saveCase";
import { saveCaseData } from "@/actions/case_builder/caseBuilder";

export default function DemographicsForm() {
  const { onDataChange, demographicData: initialData, setCaseId, caseId } = useFormContext();
  const [demographicsData, setDemographicsData] = useState<DemographicFormData>(initialData);
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
      stepDescription="Step 1 of 9: Basic identification and admission details"
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
                    <InfoTooltip content="Number of days hospitalized BEFORE simulation start." />
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
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </FormShell>
  )
}
