"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertCircleIcon, ArrowLeft, Loader2, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CourseEditBundle,
  completeAllSessionsForAssignment,
  createFacultySection,
  createSectionEnrollment,
  deleteCourse,
  expireAllSessionsForAssignment,
  replaceSectionTemplateGroups,
  updateCourse,
  updateSection,
} from "@/actions/courses";
import { getUsersByEmails, provisionStudents } from "@/actions/users";
import SectionGroupsEditor, {
  CourseGroupsLiveProvider,
  useCourseGroupsLive,
} from "./SectionGroupsEditor";
import { DateTimePicker } from "../../new/SectionCard";
import {
  GVSU_EMAIL_DOMAIN,
  parseStudentCSV,
  studentFromCsvFields,
} from "../../new/csvStudents";
import type { Student } from "../../new/types";

type Props = { bundle: CourseEditBundle };
type SecDraft = Record<"name" | "semester" | "meeting_time" | "start_date" | "end_date", string>;

export default function EditCourseClient({ bundle }: Props) {
  return (
    <CourseGroupsLiveProvider courseId={bundle.course.id} sections={bundle.sections}>
      <EditCourseForm bundle={bundle} />
    </CourseGroupsLiveProvider>
  );
}

function EditCourseForm({ bundle }: Props) {
  const router = useRouter();
  const { bySection, courseId, unassigned, setUnassigned } = useCourseGroupsLive();
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvError, setCsvError] = useState("");
  const [manual, setManual] = useState({ userName: "", firstName: "", lastName: "" });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<"save" | "delete" | string | null>(null);
  const [name, setName] = useState(bundle.course.name);
  const [code, setCode] = useState(bundle.course.code);
  const [active, setActive] = useState(bundle.course.active ?? true);
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, SecDraft>>(
    Object.fromEntries(
      bundle.sections.map((s) => [
        s.id,
        {
          name: s.name,
          semester: s.semester ?? "",
          meeting_time: s.meeting_time ?? "",
          start_date: s.start_date ?? "",
          end_date: s.end_date ?? "",
        },
      ])
    )
  );

  const patchSection = (id: string, patch: Partial<SecDraft>) =>
    setSectionDrafts((p) => ({ ...p, [id]: { ...p[id], ...patch } }));

  const aliasName = (sectionId: string, n: string) => {
    const a = bySection[sectionId]?.nameAliases ?? {};
    let cur = n;
    for (let i = 0; i < 20 && a[cur]; i++) cur = a[cur];
    return cur;
  };

  const ingest = async (parsed: Student[]) => {
    await provisionStudents(parsed);
    const users = await getUsersByEmails(
      parsed.map((s) => s.email).filter((e): e is string => Boolean(e))
    );
    const taken = new Set([
      ...unassigned.map((s) => s.id),
      ...Object.values(bySection).flatMap((d) =>
        Object.values(d.groups).flatMap((g) => g.map((s) => s.id))
      ),
    ]);
    const mapped: Student[] = users
      .filter((u) => !taken.has(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: "student",
        is_active: true,
      }));
    setUnassigned((p) => [...p, ...mapped]);
    return mapped.length;
  };

  const onCsv = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.split(".").pop()?.toLowerCase() !== "csv") {
      setCsvError(`Expected .csv, received .${file.name.split(".").pop()}`);
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const n = await ingest(parseStudentCSV(String(ev.target?.result ?? "")));
        setCsvError("");
        toast.success(`${n} students added to unassigned.`);
      } catch (err: unknown) {
        setCsvError(err instanceof Error ? err.message : "Upload failed");
      }
    };
    reader.readAsText(file);
  };

  const onManual = async () => {
    const userName = manual.userName.trim();
    const firstName = manual.firstName.trim();
    const lastName = manual.lastName.trim();
    if (!userName || !firstName || !lastName) {
      toast.error("User Name, First Name, and Last Name are required.");
      return;
    }
    try {
      const n = await ingest([studentFromCsvFields(userName, firstName, lastName)]);
      if (!n) toast.error("Student already in this course.");
      else {
        toast.success(`Added ${firstName} ${lastName} (${userName}${GVSU_EMAIL_DOMAIN}).`);
        setManual({ userName: "", firstName: "", lastName: "" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add student");
    }
  };

  const save = async () => {
    setBusy("save");
    const stop = (msg: string) => {
      toast.error(msg);
      setBusy(null);
    };
    const courseResult = await updateCourse({ id: bundle.course.id, name, code, active });
    if (!courseResult.success) return stop(courseResult.message);

    for (const [sectionId, draft] of Object.entries(sectionDrafts)) {
      const sectionResult = await updateSection({
        id: sectionId,
        name: draft.name,
        semester: draft.semester || null,
        meeting_time: draft.meeting_time || null,
        start_date: draft.start_date || null,
        end_date: draft.end_date || null,
      });
      if (!sectionResult.success) return stop(sectionResult.message);

      const g = bySection[sectionId] ?? {
        groups: {},
        groupIds: {},
        facultyLeads: {},
        nameAliases: {},
      };
      const groupsResult = await replaceSectionTemplateGroups(
        sectionId,
        Object.entries(g.groups).map(([groupName, students]) => ({
          id: g.groupIds[groupName],
          name: groupName,
          studentIds: students.map((s) => s.id),
          facultyLeadId: g.facultyLeads[groupName] || null,
        })),
        { courseId }
      );
      if (!groupsResult.success) return stop(groupsResult.message);

      for (const facultyId of new Set(Object.values(g.facultyLeads).filter(Boolean))) {
        await createFacultySection({ section_id: sectionId, faculty_id: facultyId, active: true });
      }
      for (const student of unassigned) {
        await createSectionEnrollment({
          section_id: sectionId,
          student_id: student.id,
          active: true,
        });
      }
    }
    toast.success("Course saved.");
    router.refresh();
    setBusy(null);
  };

  const destroy = async () => {
    setBusy("delete");
    const result = await deleteCourse(bundle.course.id);
    if (!result.success) {
      toast.error(result.message);
      setBusy(null);
      return;
    }
    toast.success("Course deleted.");
    router.push("/admin/courses");
  };

  const bulk = async (assignmentId: string, action: "complete" | "expire") => {
    setBusy(assignmentId);
    const result =
      action === "complete"
        ? await completeAllSessionsForAssignment(assignmentId)
        : await expireAllSessionsForAssignment(assignmentId);
    if (!result.success) toast.error(result.message);
    else {
      toast.success(result.message);
      router.refresh();
    }
    setBusy(null);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50/50">
      <header className="bg-white border-b px-8 py-4 sticky top-0 z-10 flex justify-between items-center gap-4">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href={`/admin/courses/${bundle.course.id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to assignments
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Edit Course</h1>
        </div>
        <div className="flex gap-2">
          <AlertDialog onOpenChange={(o) => !o && setConfirmDelete(false)}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={!!busy}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete course
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this course?</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently deletes the course, sections, groups, assignments, and sessions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={confirmDelete}
                  onCheckedChange={(v) => setConfirmDelete(v === true)}
                />
                I understand this cannot be undone
              </label>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600"
                  disabled={!confirmDelete || busy === "delete"}
                  onClick={destroy}
                >
                  {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete course"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={save} disabled={!!busy}>
            {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save course"}
          </Button>
        </div>
      </header>

      <div className="px-8 py-6 space-y-8 max-w-7xl">
        <Card className="pt-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="size-5 text-blue-600" /> Add students
            </CardTitle>
            <CardDescription>
              CSV or manual (User Name, First Name, Last Name). Email →{" "}
              <span className="font-mono">username{GVSU_EMAIL_DOMAIN}</span> automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="csv">
              <TabsList>
                <TabsTrigger value="csv">Upload CSV</TabsTrigger>
                <TabsTrigger value="manual">Add manually</TabsTrigger>
              </TabsList>
              <TabsContent value="csv" className="flex flex-col gap-2 mt-3">
                <div className="flex gap-2">
                  <Input ref={fileRef} onChange={onCsv} type="file" accept=".csv" className="pt-2 cursor-pointer" />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCsvError("");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    <X /> Clear
                  </Button>
                </div>
                {csvError && (
                  <Alert className="bg-red-50" variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Upload failed!</AlertTitle>
                    <AlertDescription>{csvError}</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              <TabsContent value="manual" className="mt-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(
                    [
                      ["userName", "User Name", "muldermm"],
                      ["firstName", "First Name", "Matt"],
                      ["lastName", "Last Name", "Miller"],
                    ] as const
                  ).map(([key, label, ph]) => (
                    <div key={key}>
                      <Label>{label}</Label>
                      <Input
                        value={manual[key]}
                        onChange={(e) => setManual((m) => ({ ...m, [key]: e.target.value }))}
                        placeholder={ph}
                      />
                      {key === "userName" && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {(manual.userName.trim() || "username") + GVSU_EMAIL_DOMAIN}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <Button onClick={onManual}>Add to unassigned</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <section className="bg-white border rounded-lg p-5 space-y-4">
          <h2 className="text-lg font-semibold">Course</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={setActive} id="course-active" />
            <Label htmlFor="course-active">Active</Label>
          </div>
        </section>

        {bundle.sections.map((section) => {
          const draft = sectionDrafts[section.id];
          return (
            <section key={section.id} className="bg-white border rounded-lg p-5 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{section.name}</h2>
                <Badge variant="outline">
                  {section.enrollments.filter((e) => e.active).length} enrolled
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Section name</Label>
                  <Input
                    value={draft?.name ?? ""}
                    onChange={(e) => patchSection(section.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Semester</Label>
                  <Input
                    value={draft?.semester ?? ""}
                    onChange={(e) => patchSection(section.id, { semester: e.target.value })}
                  />
                </div>
              </div>
              <div className="pb-3 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(
                  [
                    ["start_date", "Start Date"],
                    ["end_date", "End Date"],
                    ["meeting_time", "Meeting Time"],
                  ] as const
                ).map(([field, label]) => (
                  <DateTimePicker
                    key={field}
                    label={label}
                    value={draft?.[field] || null}
                    onChange={(iso) => patchSection(section.id, { [field]: iso ?? "" })}
                  />
                ))}
              </div>

              <SectionGroupsEditor section={section} />

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Simulations</h3>
                {!section.assignments.length && (
                  <p className="text-xs text-muted-foreground">No cases assigned yet.</p>
                )}
                {section.assignments.map((a) => (
                  <div key={a.id} className="border rounded-md p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{a.case?.name || "Untitled case"}</p>
                        <p className="text-xs text-muted-foreground">
                          Presim {a.presim_time ? format(new Date(a.presim_time), "PPp") : "—"} · Sim{" "}
                          {a.sim_time ? format(new Date(a.sim_time), "PPp") : "—"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {(["complete", "expire"] as const).map((action) => (
                          <Button
                            key={action}
                            size="sm"
                            variant="outline"
                            disabled={busy === a.id}
                            onClick={() => bulk(a.id, action)}
                          >
                            {action === "complete" ? "Complete all" : "Expire all"}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {a.groups.map((g) => (
                      <div key={g.id} className="bg-slate-50 rounded p-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-medium">{aliasName(section.id, g.name)}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {g.session?.status ?? "no session"}
                            {g.session?.current_phase != null ? ` · phase ${g.session.current_phase}` : ""}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {g.members
                            .map((m) => m.student?.full_name || m.student?.email || m.student_id)
                            .filter(Boolean)
                            .join(", ") || "No members"}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
