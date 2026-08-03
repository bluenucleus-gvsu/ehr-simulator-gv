"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  ArrowLeft,
  CheckCircle2Icon,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
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
import type { Student } from "../../new/types";

type Props = {
  bundle: CourseEditBundle;
};

function parseCSV(text: string): Student[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) throw new Error("CSV file is empty or contains only headers");
  const header = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const cols = ["User Name", "First Name", "Last Name"];
  const indices = cols.map((col) => header.indexOf(col));
  if (indices.includes(-1)) {
    throw new Error(`Missing columns: ${cols.filter((_, i) => indices[i] === -1).join(", ")}`);
  }
  const [uIdx, fIdx, lIdx] = indices;
  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else current += char;
      }
      values.push(current.trim());
      const clean = (idx: number) => values[idx]?.replace(/"/g, "") || "";
      return {
        id: crypto.randomUUID(),
        email: `${clean(uIdx)}@mail.gvsu.edu`,
        full_name: `${clean(fIdx)} ${clean(lIdx)}`.trim(),
        role: "student",
        status: null,
        created_at: null,
        updated_at: null,
      } satisfies Student;
    });
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fileUploadError, setFileUploadError] = useState("");
  const [csvCount, setCsvCount] = useState(0);
  const [manual, setManual] = useState({ userName: "", firstName: "", lastName: "" });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState(bundle.course.name);
  const [code, setCode] = useState(bundle.course.code);
  const [active, setActive] = useState(bundle.course.active ?? true);
  const [saving, setSaving] = useState(false);
  const [sectionDrafts, setSectionDrafts] = useState(
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
  const [busyAssignmentId, setBusyAssignmentId] = useState<string | null>(null);

  const resolveGroupName = (sectionId: string, name: string) => {
    const aliases = bySection[sectionId]?.nameAliases ?? {};
    let current = name;
    for (let i = 0; i < 20 && aliases[current]; i++) current = aliases[current];
    return current;
  };

  const ingestStudents = async (parsed: Student[]) => {
    await provisionStudents(parsed);
    const emails = parsed.map((s) => s.email).filter((email): email is string => Boolean(email));
    const users = await getUsersByEmails(emails);
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
    setUnassigned((prev) => [...prev, ...mapped]);
    return mapped.length;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.split(".").pop()?.toLowerCase() !== "csv") {
      setFileUploadError(`Expected .csv, received .${file.name.split(".").pop()}`);
      setSelectedFile(undefined);
      setCsvCount(0);
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const count = await ingestStudents(parseCSV(event.target?.result as string));
        setSelectedFile(file);
        setCsvCount(count);
        setFileUploadError("");
        toast.success(`${count} students added to unassigned.`);
      } catch (err: unknown) {
        setFileUploadError(err instanceof Error ? err.message : "Upload failed");
        setSelectedFile(undefined);
        setCsvCount(0);
      }
    };
    reader.readAsText(file);
  };

  const handleManualAdd = async () => {
    const userName = manual.userName.trim();
    const firstName = manual.firstName.trim();
    const lastName = manual.lastName.trim();
    if (!userName || !firstName || !lastName) {
      toast.error("User Name, First Name, and Last Name are required.");
      return;
    }
    try {
      const count = await ingestStudents([
        {
          id: crypto.randomUUID(),
          email: `${userName}@mail.gvsu.edu`,
          full_name: `${firstName} ${lastName}`.trim(),
          role: "student",
          status: null,
          created_at: null,
          updated_at: null,
        },
      ]);
      if (count === 0) toast.error("Student already in this course.");
      else {
        toast.success(`Added ${firstName} ${lastName} (${userName}@mail.gvsu.edu) to unassigned.`);
        setManual({ userName: "", firstName: "", lastName: "" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add student");
    }
  };

  const handleClearCsv = () => {
    setSelectedFile(undefined);
    setFileUploadError("");
    setCsvCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveEverything = async () => {
    setSaving(true);
    const courseResult = await updateCourse({ id: bundle.course.id, name, code, active });
    if (!courseResult.success) {
      toast.error(courseResult.message);
      setSaving(false);
      return;
    }
    for (const [sectionId, draft] of Object.entries(sectionDrafts)) {
      const sectionResult = await updateSection({
        id: sectionId,
        name: draft.name,
        semester: draft.semester || null,
        meeting_time: draft.meeting_time || null,
        start_date: draft.start_date || null,
        end_date: draft.end_date || null,
      });
      if (!sectionResult.success) {
        toast.error(sectionResult.message);
        setSaving(false);
        return;
      }
      const groupsDraft = bySection[sectionId] ?? {
        groups: {},
        groupIds: {},
        facultyLeads: {},
        nameAliases: {},
      };
      const groupsResult = await replaceSectionTemplateGroups(
        sectionId,
        Object.entries(groupsDraft.groups).map(([groupName, students]) => ({
          id: groupsDraft.groupIds[groupName],
          name: groupName,
          studentIds: students.map((s) => s.id),
          facultyLeadId: groupsDraft.facultyLeads[groupName] || null,
        })),
        { courseId }
      );
      if (!groupsResult.success) {
        toast.error(groupsResult.message);
        setSaving(false);
        return;
      }
      for (const facultyId of new Set(Object.values(groupsDraft.facultyLeads).filter(Boolean))) {
        await createFacultySection({
          section_id: sectionId,
          faculty_id: facultyId,
          active: true,
        });
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
    setSaving(false);
  };

  const handleDeleteCourse = async () => {
    setDeleting(true);
    const result = await deleteCourse(bundle.course.id);
    if (!result.success) {
      toast.error(result.message);
      setDeleting(false);
      return;
    }
    toast.success("Course deleted.");
    router.push("/admin/courses");
  };

  const runBulk = async (assignmentId: string, action: "complete" | "expire") => {
    setBusyAssignmentId(assignmentId);
    const result =
      action === "complete"
        ? await completeAllSessionsForAssignment(assignmentId)
        : await expireAllSessionsForAssignment(assignmentId);
    if (!result.success) toast.error(result.message);
    else {
      toast.success(result.message);
      router.refresh();
    }
    setBusyAssignmentId(null);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50/50">
      <header className="bg-white border-b px-8 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-1">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
              <Link href={`/admin/courses/${bundle.course.id}`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to assignments
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-blue-900">Edit Course</h1>
            <p className="text-xs text-gray-500">
              Course metadata, section roster, and per-simulation groups.
            </p>
          </div>
          <div className="flex gap-2">
            <AlertDialog
              onOpenChange={(open) => {
                if (!open) setConfirmDelete(false);
              }}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={saving || deleting}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete course
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this course?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes the course, sections, groups, assignments, and sessions.
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
                    disabled={!confirmDelete || deleting}
                    onClick={handleDeleteCourse}
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete course"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={saveEverything} disabled={saving || deleting}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save course"}
            </Button>
          </div>
        </div>
      </header>

      <div className="px-8 py-6 space-y-8 max-w-7xl">
        <Card className="pt-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="size-5 text-blue-600" /> Add students
            </CardTitle>
            <CardDescription>
              Upload a CSV or enter User Name, First Name, and Last Name. Email is set to{" "}
              <span className="font-mono">username@mail.gvsu.edu</span> automatically.
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
                  <Input
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    type="file"
                    accept=".csv"
                    className="pt-2 cursor-pointer"
                  />
                  <Button className="cursor-pointer flex-shrink-0" variant="secondary" onClick={handleClearCsv}>
                    <X /> Clear
                  </Button>
                </div>
                {fileUploadError && (
                  <Alert className="bg-red-50" variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Upload failed!</AlertTitle>
                    <AlertDescription>{fileUploadError}</AlertDescription>
                  </Alert>
                )}
                {selectedFile && !fileUploadError && (
                  <Alert className="text-green-600 bg-green-50">
                    <CheckCircle2Icon />
                    <AlertTitle>
                      Success! {csvCount} students loaded from{" "}
                      <span className="font-mono">{selectedFile.name}</span>
                    </AlertTitle>
                  </Alert>
                )}
              </TabsContent>
              <TabsContent value="manual" className="mt-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>User Name</Label>
                    <Input
                      value={manual.userName}
                      onChange={(e) => setManual((m) => ({ ...m, userName: e.target.value }))}
                      placeholder="muldermm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email →{" "}
                      <span className="font-mono">
                        {(manual.userName.trim() || "username") + "@mail.gvsu.edu"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={manual.firstName}
                      onChange={(e) => setManual((m) => ({ ...m, firstName: e.target.value }))}
                      placeholder="Matt"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={manual.lastName}
                      onChange={(e) => setManual((m) => ({ ...m, lastName: e.target.value }))}
                      placeholder="Miller"
                    />
                  </div>
                </div>
                <Button onClick={handleManualAdd}>Add to unassigned</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <section className="bg-white border rounded-lg p-5 space-y-4">
          <h2 className="text-lg font-semibold">Course</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course-code">Code</Label>
              <Input id="course-code" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="course-name">Name</Label>
              <Input id="course-name" value={name} onChange={(e) => setName(e.target.value)} />
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
                    onChange={(e) =>
                      setSectionDrafts((prev) => ({
                        ...prev,
                        [section.id]: { ...prev[section.id], name: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Semester</Label>
                  <Input
                    value={draft?.semester ?? ""}
                    onChange={(e) =>
                      setSectionDrafts((prev) => ({
                        ...prev,
                        [section.id]: { ...prev[section.id], semester: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="pb-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-3">Schedule</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <DateTimePicker
                    label="Start Date"
                    value={draft?.start_date || null}
                    onChange={(iso) =>
                      setSectionDrafts((prev) => ({
                        ...prev,
                        [section.id]: { ...prev[section.id], start_date: iso ?? "" },
                      }))
                    }
                  />
                  <DateTimePicker
                    label="End Date"
                    value={draft?.end_date || null}
                    onChange={(iso) =>
                      setSectionDrafts((prev) => ({
                        ...prev,
                        [section.id]: { ...prev[section.id], end_date: iso ?? "" },
                      }))
                    }
                  />
                  <DateTimePicker
                    label="Meeting Time"
                    value={draft?.meeting_time || null}
                    onChange={(iso) =>
                      setSectionDrafts((prev) => ({
                        ...prev,
                        [section.id]: { ...prev[section.id], meeting_time: iso ?? "" },
                      }))
                    }
                  />
                </div>
              </div>

              <SectionGroupsEditor section={section} />

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Simulations</h3>
                {section.assignments.length === 0 && (
                  <p className="text-xs text-muted-foreground">No cases assigned yet.</p>
                )}
                {section.assignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-md p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {assignment.case?.name || "Untitled case"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Presim{" "}
                          {assignment.presim_time
                            ? format(new Date(assignment.presim_time), "PPp")
                            : "—"}{" "}
                          · Sim{" "}
                          {assignment.sim_time
                            ? format(new Date(assignment.sim_time), "PPp")
                            : "—"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyAssignmentId === assignment.id}
                          onClick={() => runBulk(assignment.id, "complete")}
                        >
                          Complete all
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyAssignmentId === assignment.id}
                          onClick={() => runBulk(assignment.id, "expire")}
                        >
                          Expire all
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {assignment.groups.map((group) => (
                        <div key={group.id} className="bg-slate-50 rounded p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-medium">
                              {resolveGroupName(section.id, group.name)}
                            </p>
                            <Badge variant="outline" className="text-[10px]">
                              {group.session?.status ?? "no session"}
                              {group.session?.current_phase != null
                                ? ` · phase ${group.session.current_phase}`
                                : ""}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {group.members
                              .map(
                                (m) =>
                                  m.student?.full_name ||
                                  m.student?.email ||
                                  m.student_id
                              )
                              .filter(Boolean)
                              .join(", ") || "No members"}
                          </p>
                        </div>
                      ))}
                    </div>
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
