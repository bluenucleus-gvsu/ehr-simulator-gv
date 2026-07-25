"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, AlertCircleIcon, Check, CheckCircle2Icon, ChevronsUpDown, Loader2, Plus, Trash2, Upload, UserCog, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { cn } from "@/lib/utils";
import {
  CourseEditAssignment,
  CourseEditBundle,
  CourseEditSection,
  addStudentsToCourse,
  createSection,
  deleteCourse,
  deleteSection,
  removeStudentFromCourse,
  replaceAssignmentGroups,
  replaceSectionTemplateGroups,
  setCourseAdministrators,
  updateCourse,
  updateSection,
  type AssignmentGroupPayload,
} from "@/actions/courses";
import { getAllAdminUsers, getAllFacultyUsers } from "@/actions/users";
import AddStudentForm, { type ManualStudentInput } from "@/app/admin/courses/AddStudentForm";
import { parseStudentCSV } from "@/app/admin/courses/parseStudentCSV";
import {
  DateTimePicker,
  SectionCard,
  generateGroupNames,
  randomlyAssignGroups,
  type SectionGroups,
} from "@/app/admin/courses/new/SectionCard";
import type { FacultyMember, Student } from "@/app/admin/courses/new/types";
import {
  SHARED_POOL,
  UNASSIGNED_GROUP,
  buildInitialGroupState,
  removeStudentFromAllGroups,
  studentKey,
  withoutStudent,
  type SectionGroupState,
} from "./editCourseGroupState";

type Props = {
  bundle: CourseEditBundle;
};

function generateSemesters(): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const semesters: string[] = [];
  for (let i = 0; i < 3; i++) {
    const year = currentYear + i;
    semesters.push(`Winter ${year}`, `Summer ${year}`, `Fall ${year}`);
  }
  return semesters;
}

const SEMESTERS = generateSemesters();

function studentLabel(fullName: string | null, email: string | null) {
  return fullName || email || "Unknown student";
}

type AdminUser = { id: string; full_name: string | null; email: string | null };

export default function EditCourseClient({ bundle }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [courseName, setCourseName] = useState(bundle.course.name);
  const [courseCode, setCourseCode] = useState(bundle.course.code);
  const [courseDescription, setCourseDescription] = useState(bundle.course.description ?? "");
  const [courseActive, setCourseActive] = useState(bundle.course.active ?? true);
  const [adminIds, setAdminIds] = useState<string[]>(
    bundle.administrators.map((a) => a.admin_id)
  );
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminsOpen, setAdminsOpen] = useState(false);
  const [sections, setSections] = useState(bundle.sections);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fileUploadError, setFileUploadError] = useState("");
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const initialGroups = useMemo(
    () => buildInitialGroupState(bundle.sections),
    [bundle]
  );
  const [sharedUnassigned, setSharedUnassigned] = useState<Student[]>(
    initialGroups.sharedUnassigned
  );
  const [sectionStates, setSectionStates] = useState<Record<string, SectionGroupState>>(
    initialGroups.sectionStates
  );
  const [facultyUsers, setFacultyUsers] = useState<FacultyMember[]>([]);
  const [draggedStudent, setDraggedStudent] = useState<{
    student: Student;
    fromGroup: string;
    fromSection: string;
  } | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);

  const courseStudents = useMemo(() => {
    const map = new Map<
      string,
      { id: string; full_name: string | null; email: string | null }
    >();
    for (const section of sections) {
      for (const enrollment of section.enrollments) {
        if (!enrollment.active || !enrollment.student_id) continue;
        map.set(enrollment.student_id, {
          id: enrollment.student_id,
          full_name: enrollment.student?.full_name ?? null,
          email: enrollment.student?.email ?? null,
        });
      }
    }
    for (const student of sharedUnassigned) {
      if (!student.id) continue;
      map.set(student.id, {
        id: student.id,
        full_name: student.full_name ?? null,
        email: student.email ?? null,
      });
    }
    return [...map.values()].sort((a, b) =>
      studentLabel(a.full_name, a.email).localeCompare(studentLabel(b.full_name, b.email))
    );
  }, [sections, sharedUnassigned]);

  useEffect(() => {
    setCourseName(bundle.course.name);
    setCourseCode(bundle.course.code);
    setCourseDescription(bundle.course.description ?? "");
    setCourseActive(bundle.course.active ?? true);
    setAdminIds(bundle.administrators.map((a) => a.admin_id));
    setSections(bundle.sections);
    const next = buildInitialGroupState(bundle.sections);
    setSharedUnassigned(next.sharedUnassigned);
    setSectionStates(next.sectionStates);
  }, [bundle]);

  useEffect(() => {
    getAllAdminUsers()
      .then((users) =>
        setAdminUsers(
          users.map((u) => ({ id: u.id, full_name: u.full_name, email: u.email }))
        )
      )
      .catch(() => toast.error("Failed to load admin users."));
    getAllFacultyUsers()
      .then(setFacultyUsers)
      .catch(() => toast.error("Failed to load faculty users."));
  }, []);

  const handleRemoveStudent = (student: Student) => {
    if (!student.id) return;
    const label = studentLabel(student.full_name ?? null, student.email ?? null);
    const ok = window.confirm(`Remove ${label} from this course?`);
    if (!ok) return;

    setSharedUnassigned((prev) => withoutStudent(prev, student));
    setSectionStates((prev) => removeStudentFromAllGroups(prev, student));

    startTransition(async () => {
      const result = await removeStudentFromCourse(bundle.course.id, student.id!);
      if (!result.success) {
        toast.error(result.message);
        router.refresh();
        return;
      }
      toast.success("Student removed.");
      router.refresh();
    });
  };

  const selectedAdmins = useMemo(() => {
    const byId = new Map(adminUsers.map((u) => [u.id, u]));
    return adminIds.map((id) => {
      const user = byId.get(id);
      if (user) return user;
      const fromBundle = bundle.administrators.find((a) => a.admin_id === id)?.admin;
      return {
        id,
        full_name: fromBundle?.full_name ?? null,
        email: fromBundle?.email ?? null,
      };
    });
  }, [adminIds, adminUsers, bundle.administrators]);

  const saveCourse = () => {
    startTransition(async () => {
      const result = await updateCourse({
        id: bundle.course.id,
        name: courseName,
        code: courseCode,
        description: courseDescription.trim() || null,
        active: courseActive,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      const adminsResult = await setCourseAdministrators(bundle.course.id, adminIds);
      if (!adminsResult.success) {
        toast.error(adminsResult.message);
        return;
      }
      for (const section of sections) {
        const ok = await persistSectionGroups(section);
        if (!ok) return;
      }
      toast.success("Course updated.");
      router.refresh();
    });
  };

  const addSection = () => {
    setIsAddingSection(true);
    startTransition(async () => {
      const result = await createSection({
        course_id: bundle.course.id,
        name: `Section ${sections.length + 1}`,
        semester: sections[0]?.semester ?? null,
      });
      setIsAddingSection(false);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const assignedIds = new Set<string>();
      for (const section of sections) {
        for (const group of section.templateGroups) {
          for (const member of group.members) {
            if (member.student_id) assignedIds.add(member.student_id);
          }
        }
        for (const assignment of section.assignments) {
          for (const group of assignment.groups) {
            for (const member of group.members) {
              if (member.student_id) assignedIds.add(member.student_id);
            }
          }
        }
      }

      const stillUnassigned = courseStudents.filter(
        (s) => s.email && !assignedIds.has(s.id)
      );

      if (stillUnassigned.length > 0) {
        const enrollResult = await addStudentsToCourse(
          bundle.course.id,
          stillUnassigned.map((s) => ({
            email: s.email!,
            full_name: s.full_name ?? "",
          }))
        );
        if (!enrollResult.success) {
          toast.error(enrollResult.message);
          return;
        }
      }

      toast.success("Section added.");
      router.refresh();
    });
  };

  const handleDeleteCourse = () => {
    startTransition(async () => {
      const result = await deleteCourse(bundle.course.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Course deleted.");
      router.push("/admin/courses");
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    startTransition(async () => {
      const result = await deleteSection(sectionId, bundle.course.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Section deleted.");
      router.refresh();
    });
  };

  const persistStudents = async (
    students: Array<{ email: string; full_name: string }>
  ) => {
    if (students.length === 0) return;
    setIsAddingStudents(true);
    try {
      const result = await addStudentsToCourse(bundle.course.id, students);
      if (!result.success) {
        throw new Error(result.message);
      }
      toast.success(result.message);
      router.refresh();
    } finally {
      setIsAddingStudents(false);
    }
  };

  const handleAddManualStudent = async (input: ManualStudentInput) => {
    const exists = courseStudents.some(
      (s) => s.email?.toLowerCase() === input.email.toLowerCase()
    );
    if (exists) {
      throw new Error(`Student with email ${input.email} is already in this course.`);
    }
    await persistStudents([{ email: input.email, full_name: input.full_name }]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.split(".").pop()?.toLowerCase() !== "csv") {
      setFileUploadError(`Expected .csv, received .${file.name.split(".").pop()}`);
      setSelectedFile(undefined);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = parseStudentCSV(event.target?.result as string);
        const existingEmails = new Set(
          courseStudents
            .map((s) => s.email?.toLowerCase())
            .filter(Boolean) as string[]
        );
        const fresh = parsed.filter(
          (s) => s.email && !existingEmails.has(s.email.toLowerCase())
        );
        if (fresh.length === 0) {
          setFileUploadError("No new students found in this CSV.");
          setSelectedFile(undefined);
          return;
        }
        setSelectedFile(file);
        setFileUploadError("");
        await persistStudents(
          fresh
            .filter((s): s is typeof s & { email: string } => Boolean(s.email))
            .map((s) => ({
              email: s.email,
              full_name: s.full_name ?? "",
            }))
        );
      } catch (err) {
        setFileUploadError(err instanceof Error ? err.message : "Failed to parse CSV.");
        setSelectedFile(undefined);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleClearFile = () => {
    setSelectedFile(undefined);
    setFileUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragStart = (
    e: React.DragEvent,
    student: Student,
    fromGroup?: string,
    fromSection?: string
  ) => {
    if (!fromGroup || !fromSection) return;
    setDraggedStudent({ student, fromGroup, fromSection });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedStudent(null);
    setDragOverGroup(null);
  };

  const handleDragOver = (e: React.DragEvent, sectionName: string, groupName: string) => {
    e.preventDefault();
    setDragOverGroup(`${sectionName}::${groupName}`);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverGroup(null);
    }
  };

  const handleDrop = (e: React.DragEvent, toGroup: string, toSection: string) => {
    e.preventDefault();
    if (!draggedStudent) return;

    const { student, fromGroup, fromSection } = draggedStudent;
    const fromShared = fromGroup === UNASSIGNED_GROUP || fromSection === SHARED_POOL;
    const toShared = toGroup === UNASSIGNED_GROUP;

    if (fromShared && toShared) return;
    if (!fromShared && fromSection === toSection && fromGroup === toGroup) return;

    if (fromShared && !toShared) {
      setSharedUnassigned((prev) => withoutStudent(prev, student));
      setSectionStates((prev) => {
        const state = prev[toSection];
        if (!state) return prev;
        return {
          ...prev,
          [toSection]: {
            ...state,
            groups: {
              ...state.groups,
              [toGroup]: [...withoutStudent(state.groups[toGroup] ?? [], student), student],
            },
          },
        };
      });
    } else if (!fromShared && toShared) {
      setSectionStates((prev) => {
        const state = prev[fromSection];
        if (!state) return prev;
        return {
          ...prev,
          [fromSection]: {
            ...state,
            groups: {
              ...state.groups,
              [fromGroup]: withoutStudent(state.groups[fromGroup] ?? [], student),
            },
          },
        };
      });
      setSharedUnassigned((prev) => [...withoutStudent(prev, student), student]);
    } else if (!fromShared && !toShared) {
      setSectionStates((prev) => {
        const fromState = prev[fromSection];
        const toState = prev[toSection];
        if (!fromState || !toState) return prev;

        if (fromSection === toSection) {
          const groups = { ...fromState.groups };
          groups[fromGroup] = withoutStudent(groups[fromGroup] ?? [], student);
          groups[toGroup] = [...withoutStudent(groups[toGroup] ?? [], student), student];
          return {
            ...prev,
            [toSection]: { ...fromState, groups },
          };
        }

        return {
          ...prev,
          [fromSection]: {
            ...fromState,
            groups: {
              ...fromState.groups,
              [fromGroup]: withoutStudent(fromState.groups[fromGroup] ?? [], student),
            },
          },
          [toSection]: {
            ...toState,
            groups: {
              ...toState.groups,
              [toGroup]: [...withoutStudent(toState.groups[toGroup] ?? [], student), student],
            },
          },
        };
      });
    }

    setDraggedStudent(null);
    setDragOverGroup(null);
  };

  const handleGroupSizeChange = (sectionName: string, size: number) => {
    setSectionStates((prev) => ({
      ...prev,
      [sectionName]: { ...prev[sectionName], groupSize: size },
    }));
  };

  const handleRandomAssign = (sectionName: string) => {
    const state = sectionStates[sectionName];
    if (!state) return;
    const pool = [...sharedUnassigned, ...Object.values(state.groups).flat()];
    if (pool.length === 0) return;
    const names = Object.keys(state.groups);
    if (names.length === 0) {
      const created = randomlyAssignGroups(pool, state.groupSize);
      setSectionStates((prev) => ({
        ...prev,
        [sectionName]: { ...prev[sectionName], groups: created },
      }));
      setSharedUnassigned([]);
      return;
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const next: SectionGroups = {};
    names.forEach((name) => {
      next[name] = [];
    });
    shuffled.forEach((student, index) => {
      next[names[index % names.length]].push(student);
    });
    setSectionStates((prev) => ({
      ...prev,
      [sectionName]: { ...prev[sectionName], groups: next },
    }));
    setSharedUnassigned([]);
  };

  const handleUnassignAll = (sectionName: string) => {
    const state = sectionStates[sectionName];
    if (!state) return;
    const fromGroups = Object.values(state.groups).flat();
    setSectionStates((prev) => {
      const groups: SectionGroups = {};
      Object.keys(state.groups).forEach((name) => {
        groups[name] = [];
      });
      return { ...prev, [sectionName]: { ...prev[sectionName], groups } };
    });
    setSharedUnassigned((prev) => [
      ...prev.filter((s) => !fromGroups.some((o) => studentKey(o) === studentKey(s))),
      ...fromGroups,
    ]);
  };

  const handleAddGroup = (sectionName: string) => {
    setSectionStates((prev) => {
      const state = prev[sectionName];
      if (!state) return prev;
      const existingNames = Object.keys(state.groups);
      let name = "";
      for (let i = 0; i < 702; i++) {
        const candidate = generateGroupNames(i + 1)[i];
        if (!existingNames.includes(candidate)) {
          name = candidate;
          break;
        }
      }
      return {
        ...prev,
        [sectionName]: {
          ...state,
          groups: { ...state.groups, [name]: [] },
        },
      };
    });
  };

  const handleRenameGroup = (sectionName: string, oldName: string, newName: string) => {
    setSectionStates((prev) => {
      const state = prev[sectionName];
      if (!state || state.groups[newName] !== undefined) return prev;
      const groups = { ...state.groups };
      groups[newName] = groups[oldName];
      delete groups[oldName];
      const groupIdsByName = { ...state.groupIdsByName };
      if (groupIdsByName[oldName]) {
        groupIdsByName[newName] = groupIdsByName[oldName];
        delete groupIdsByName[oldName];
      }
      return { ...prev, [sectionName]: { ...state, groups, groupIdsByName } };
    });
  };

  const handleDeleteGroup = (sectionName: string, groupName: string) => {
    const state = sectionStates[sectionName];
    if (!state) return;
    const students = state.groups[groupName] ?? [];
    setSectionStates((prev) => {
      const groups = { ...prev[sectionName].groups };
      delete groups[groupName];
      const groupIdsByName = { ...prev[sectionName].groupIdsByName };
      delete groupIdsByName[groupName];
      return {
        ...prev,
        [sectionName]: { ...prev[sectionName], groups, groupIdsByName },
      };
    });
    setSharedUnassigned((prev) => [
      ...prev.filter((s) => !students.some((o) => studentKey(o) === studentKey(s))),
      ...students,
    ]);
  };

  const handleGroupFacultyLeadChange = (
    sectionName: string,
    groupName: string,
    facultyId: string
  ) => {
    setSectionStates((prev) => ({
      ...prev,
      [sectionName]: {
        ...prev[sectionName],
        groupFacultyLeads: {
          ...prev[sectionName].groupFacultyLeads,
          [groupName]: facultyId,
        },
      },
    }));
  };

  const handleMoveGroup = (
    fromSection: string,
    groupName: string,
    toSection: string
  ) => {
    setSectionStates((prev) => {
      const from = prev[fromSection];
      const to = prev[toSection];
      if (!from || !to || !from.groups[groupName]) return prev;
      const movingStudents = from.groups[groupName] ?? [];
      const fromGroups = { ...from.groups };
      delete fromGroups[groupName];
      let newName = groupName;
      if (to.groups[newName] !== undefined) {
        newName = `${groupName} (moved)`;
      }
      return {
        ...prev,
        [fromSection]: { ...from, groups: fromGroups },
        [toSection]: {
          ...to,
          groups: { ...to.groups, [newName]: movingStudents },
        },
      };
    });
  };

  const persistSectionGroups = async (section: CourseEditSection): Promise<boolean> => {
    const state = sectionStates[section.name];
    if (!state) return true;

    const payload: AssignmentGroupPayload[] = Object.entries(state.groups).map(
      ([name, students]) => ({
        id: state.groupIdsByName[name],
        name,
        studentIds: students
          .map((s) => s.id)
          .filter((id): id is string => Boolean(id)),
      })
    );

    const result = await replaceSectionTemplateGroups(section.id, payload, {
      courseId: bundle.course.id,
    });
    if (!result.success) {
      toast.error(result.message);
      return false;
    }

    for (const assignment of section.assignments) {
      if (!assignment.canEditGroups) continue;
      const syncResult = await replaceAssignmentGroups(
        assignment.id,
        payload.map(({ name, studentIds }) => ({ name, studentIds })),
        { courseId: bundle.course.id }
      );
      if (!syncResult.success) {
        toast.error(syncResult.message);
        return false;
      }
    }

    return true;
  };

  const saveSection = (section: CourseEditSection) => {
    startTransition(async () => {
      const result = await updateSection({
        id: section.id,
        name: section.name,
        semester: section.semester,
        meeting_time: section.meeting_time,
        start_date: section.start_date,
        end_date: section.end_date,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      const ok = await persistSectionGroups(section);
      if (!ok) return;
      toast.success("Section saved.");
      router.refresh();
    });
  };

  const updateLocalSection = (sectionId: string, patch: Partial<CourseEditSection>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...patch } : s))
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-50/50">
      <header className="bg-white border-b px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/admin/courses/${bundle.course.id}`}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight text-blue-900">
                Edit Course
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Course metadata, section rosters, and per-simulation groups.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isPending} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this course?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes {courseCode || "this course"}, all of its
                    sections, simulations, groups, and session history. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isPending}
                    onClick={handleDeleteCourse}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Delete Course
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={saveCourse} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Course
            </Button>
          </div>
        </div>
      </header>

      <div className="px-8 py-6 space-y-8 max-w-6xl">
        <section className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Course details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-code">Code</Label>
              <Input
                id="course-code"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-name">Name</Label>
              <Input
                id="course-name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-3 pb-2">
              <Switch
                checked={courseActive}
                onCheckedChange={setCourseActive}
                id="course-active"
              />
              <Label htmlFor="course-active">Active</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              placeholder="Enter a brief description of the course..."
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>Course Administrators</Label>
            <Popover open={adminsOpen} onOpenChange={setAdminsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full sm:w-64 justify-between h-9 text-sm font-normal"
                >
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <UserCog className="w-4 h-4" />
                    {adminIds.length === 0
                      ? "Assign administrators..."
                      : `${adminIds.length} selected`}
                  </span>
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-80" align="start">
                <Command>
                  <CommandInput placeholder="Search by name..." />
                  <CommandList>
                    <CommandEmpty>No admins found.</CommandEmpty>
                    <CommandGroup>
                      {adminUsers.map((member) => {
                        const isSelected = adminIds.includes(member.id);
                        return (
                          <CommandItem
                            key={member.id}
                            value={member.full_name ?? member.email ?? member.id}
                            onSelect={() =>
                              setAdminIds((prev) =>
                                prev.includes(member.id)
                                  ? prev.filter((id) => id !== member.id)
                                  : [...prev, member.id]
                              )
                            }
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
                                isSelected ? "opacity-100 text-slate-700" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium">
                                {member.full_name ?? ""}
                              </span>
                              <span className="text-xs text-slate-500 truncate">
                                {member.email ?? ""}
                              </span>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedAdmins.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedAdmins.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-slate-800">
                        {studentLabel(member.full_name, member.email)}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {member.email ?? ""}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 flex-shrink-0 ml-2"
                      onClick={() =>
                        setAdminIds((prev) => prev.filter((id) => id !== member.id))
                      }
                    >
                      <X className="w-3 h-3 text-slate-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Administrator changes are applied when you click Save Course.
            </p>
          </div>
        </section>

        <section className="bg-white border rounded-lg p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="size-5 text-blue-600" />
              Students
            </h2>
            <p className="text-sm text-gray-500">
              Upload a CSV or type students in manually. New students start unassigned in
              every section. CSV columns: User Name, First Name, Last Name.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-600">Upload .CSV File</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                onChange={handleFileChange}
                type="file"
                accept=".csv"
                className="pt-2 cursor-pointer"
                disabled={isPending || isAddingStudents}
              />
              <Button
                variant="secondary"
                onClick={handleClearFile}
                disabled={isPending || isAddingStudents}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
                Clear
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
                  Loaded students from <span className="font-mono">{selectedFile.name}</span>
                </AlertTitle>
              </Alert>
            )}
            {isAddingStudents && (
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding students…
              </p>
            )}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus className="size-4 text-blue-600" />
              <Label className="text-sm font-medium text-slate-600">Add student manually</Label>
            </div>
            <AddStudentForm
              onAdd={handleAddManualStudent}
              disabled={isPending || isAddingStudents || sections.length === 0}
            />
            {sections.length === 0 && (
              <p className="text-sm text-amber-700">
                Add a section before enrolling students.
              </p>
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <h3 className="font-medium">
              Course roster
              <span className="ml-2 text-sm font-normal text-gray-500">
                {courseStudents.length} student{courseStudents.length === 1 ? "" : "s"}
              </span>
            </h3>
            {courseStudents.length === 0 ? (
              <p className="text-sm text-gray-500">
                No students yet. Upload a CSV or add students manually — they will appear as
                unassigned in every section until you place them in groups.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {courseStudents.map((s) => (
                  <Badge
                    key={s.id}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {studentLabel(s.full_name, s.email)}
                    <button
                      type="button"
                      className="ml-1 rounded-sm p-0.5 hover:bg-slate-300/60 text-slate-500 hover:text-red-600"
                      onClick={() =>
                        handleRemoveStudent({
                          id: s.id,
                          full_name: s.full_name,
                          email: s.email,
                          role: "student",
                          is_active: true,
                          status: null,
                          created_at: null,
                          updated_at: null,
                        })
                      }
                      aria-label={`Remove ${studentLabel(s.full_name, s.email)}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>

        {sections.map((section, index) => (
          <SectionPanel
            key={section.id}
            section={section}
            index={index}
            isPending={isPending}
            onSectionChange={(patch) => updateLocalSection(section.id, patch)}
            onSaveSection={() => {
              const current = sections.find((s) => s.id === section.id);
              if (current) saveSection(current);
            }}
            onDeleteSection={() => handleDeleteSection(section.id)}
            sharedUnassigned={sharedUnassigned}
            sectionState={sectionStates[section.name]}
            facultyMembers={facultyUsers}
            draggedStudent={draggedStudent}
            dragOverGroup={dragOverGroup}
            onGroupFacultyLeadChange={handleGroupFacultyLeadChange}
            onGroupSizeChange={(size) => handleGroupSizeChange(section.name, size)}
            onRandomAssign={() => handleRandomAssign(section.name)}
            onUnassignAll={() => handleUnassignAll(section.name)}
            onAddGroup={() => handleAddGroup(section.name)}
            onRenameGroup={handleRenameGroup}
            onDeleteGroup={handleDeleteGroup}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onMoveGroup={handleMoveGroup}
            onRemoveStudent={handleRemoveStudent}
            availableSections={sections
              .filter((s) => s.name !== section.name)
              .map((s) => ({ id: s.name, label: s.name }))}
          />
        ))}

        <Button
          variant="outline"
          onClick={addSection}
          disabled={isPending || isAddingSection}
          className="w-full border-dashed"
        >
          {isAddingSection ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Section
        </Button>
      </div>
    </div>
  );
}


function SectionPanel({
  section,
  index,
  isPending,
  onSectionChange,
  onSaveSection,
  onDeleteSection,
  sharedUnassigned,
  sectionState,
  facultyMembers,
  draggedStudent,
  dragOverGroup,
  onGroupFacultyLeadChange,
  onGroupSizeChange,
  onRandomAssign,
  onUnassignAll,
  onAddGroup,
  onRenameGroup,
  onDeleteGroup,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onMoveGroup,
  onRemoveStudent,
  availableSections,
}: {
  section: CourseEditSection;
  index: number;
  isPending: boolean;
  onSectionChange: (patch: Partial<CourseEditSection>) => void;
  onSaveSection: () => void;
  onDeleteSection: () => void;
  sharedUnassigned: Student[];
  sectionState?: SectionGroupState;
  facultyMembers: FacultyMember[];
  draggedStudent: { student: Student; fromGroup: string; fromSection: string } | null;
  dragOverGroup: string | null;
  onGroupFacultyLeadChange: (sectionName: string, groupName: string, facultyId: string) => void;
  onGroupSizeChange: (size: number) => void;
  onRandomAssign: () => void;
  onUnassignAll: () => void;
  onAddGroup: () => void;
  onRenameGroup: (sectionName: string, oldName: string, newName: string) => void;
  onDeleteGroup: (sectionName: string, groupName: string) => void;
  onDragStart: (e: React.DragEvent, student: Student, fromGroup?: string, fromSection?: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, sectionName: string, groupName: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, toGroup: string, toSection: string) => void;
  onMoveGroup: (fromSection: string, groupName: string, toSection: string) => void;
  onRemoveStudent: (student: Student) => void;
  availableSections: Array<{ id: string; label: string }>;
}) {
  return (
    <section className="bg-white border rounded-lg p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{section.name}</h2>
          <p className="text-sm text-gray-500">
            {sharedUnassigned.length} unassigned
            {section.faculty.length > 0
              ? ` · ${section.faculty.length} faculty`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isPending}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {section.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes the section, its enrollments, simulations,
                  groups, and session history. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={onDeleteSection}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  Delete Section
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={onSaveSection} disabled={isPending} variant="outline" size="sm">
            Save Section
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={section.name}
            onChange={(e) => onSectionChange({ name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Semester</Label>
          <Select
            value={section.semester ?? undefined}
            onValueChange={(value) => onSectionChange({ semester: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a semester..." />
            </SelectTrigger>
            <SelectContent>
              {section.semester && !SEMESTERS.includes(section.semester) && (
                <SelectItem value={section.semester}>{section.semester}</SelectItem>
              )}
              {SEMESTERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pb-1">
        <p className="text-xs font-semibold text-slate-500 mb-3">Schedule</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DateTimePicker
            label="Start Date"
            value={section.start_date}
            onChange={(iso) => onSectionChange({ start_date: iso })}
          />
          <DateTimePicker
            label="End Date"
            value={section.end_date}
            onChange={(iso) => onSectionChange({ end_date: iso })}
          />
          <DateTimePicker
            label="Meeting Time"
            value={section.meeting_time}
            onChange={(iso) => onSectionChange({ meeting_time: iso })}
          />
        </div>
      </div>

      <SectionCard
        section={{
          name: section.name,
          semester: section.semester,
          start_date: section.start_date,
          end_date: section.end_date,
          meeting_time: section.meeting_time,
        }}
        index={index + 1}
        groups={sectionState?.groups ?? {}}
        unassigned={sharedUnassigned}
        groupSize={sectionState?.groupSize ?? 4}
        facultyMembers={facultyMembers}
        groupFacultyLeads={sectionState?.groupFacultyLeads ?? {}}
        onGroupFacultyLeadChange={onGroupFacultyLeadChange}
        draggedStudent={draggedStudent}
        dragOverGroup={dragOverGroup}
        onSectionChange={(field, value) => onSectionChange({ [field]: value })}
        onGroupSizeChange={onGroupSizeChange}
        onRandomAssign={onRandomAssign}
        onUnassignAll={onUnassignAll}
        onAddGroup={onAddGroup}
        onRenameGroup={onRenameGroup}
        onDeleteGroup={onDeleteGroup}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        availableSections={availableSections}
        onMoveGroup={onMoveGroup}
        onRemoveStudent={onRemoveStudent}
        groupsOnly
      />

      <div className="space-y-4">
        <h3 className="font-medium">Simulations</h3>
        {section.assignments.length === 0 ? (
          <p className="text-sm text-gray-500">No simulations assigned to this section.</p>
        ) : (
          section.assignments.map((assignment) => (
            <AssignmentPanel key={assignment.id} assignment={assignment} />
          ))
        )}
      </div>
    </section>
  );
}

function AssignmentPanel({ assignment }: { assignment: CourseEditAssignment }) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-gray-50/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            {assignment.case?.name || "Untitled case"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Pre-sim {format(new Date(assignment.presim_time), "Pp")} · Sim{" "}
            {format(new Date(assignment.sim_time), "Pp")}
          </p>
        </div>
        {!assignment.canEditGroups && (
          <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
            Groups locked
          </Badge>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {assignment.groups.length === 0 ? (
          <p className="text-sm text-gray-500">
            No groups for this simulation yet. Use the section group editor above, then
            save groups.
          </p>
        ) : (
          assignment.groups.map((g) => (
            <div key={g.id} className="bg-white border rounded-md p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm">{g.name}</p>
                {g.session?.status && (
                  <Badge variant="secondary" className="text-xs">
                    {g.session.status}
                    {g.session.current_phase != null
                      ? ` · phase ${g.session.current_phase}`
                      : ""}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {g.members
                  .map((m) =>
                    studentLabel(m.student?.full_name ?? null, m.student?.email ?? null)
                  )
                  .join(", ") || "No members"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
