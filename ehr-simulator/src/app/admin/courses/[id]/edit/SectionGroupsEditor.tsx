"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { ChevronDown, ChevronUp, Plus, Shuffle, UserX, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CourseEditSection, removeStudentFromCourse } from "@/actions/courses";
import { GroupCard } from "../../new/GroupCard";
import { StudentBlock } from "../../new/StudentBlock";
import {
  generateGroupNames,
  randomlyAssignGroups,
  SectionGroups,
} from "../../new/SectionCard";
import type { FacultyMember, Student } from "../../new/types";
import { getAllAdminUsers, getAllFacultyUsers } from "@/actions/users";

type SectionDraft = {
  groups: SectionGroups;
  groupIds: Record<string, string>;
  facultyLeads: Record<string, string>;
  nameAliases: Record<string, string>;
};

type LiveCtx = {
  courseId: string;
  unassigned: Student[];
  setUnassigned: Dispatch<SetStateAction<Student[]>>;
  bySection: Record<string, SectionDraft>;
  setBySection: Dispatch<SetStateAction<Record<string, SectionDraft>>>;
  facultyMembers: FacultyMember[];
};

const LiveGroupsContext = createContext<LiveCtx | null>(null);

function toStudent(id: string, full_name: string | null, email: string | null): Student {
  return { id, full_name, email: email ?? id, role: "student", is_active: true };
}

function bootFromSections(sections: CourseEditSection[]) {
  const roster = new Map<string, Student>();
  const assigned = new Set<string>();
  for (const s of sections) {
    for (const e of s.enrollments) {
      if (!e.active || !e.student_id) continue;
      roster.set(
        e.student_id,
        toStudent(e.student_id, e.student?.full_name ?? null, e.student?.email ?? null)
      );
    }
    for (const g of s.templateGroups) {
      for (const m of g.members) {
        if (!m.student_id) continue;
        assigned.add(m.student_id);
        if (!roster.has(m.student_id)) {
          roster.set(
            m.student_id,
            toStudent(m.student_id, m.student?.full_name ?? null, m.student?.email ?? null)
          );
        }
      }
    }
  }
  const bySection: Record<string, SectionDraft> = {};
  for (const s of sections) {
    const groups: SectionGroups = {};
    const groupIds: Record<string, string> = {};
    const facultyLeads: Record<string, string> = {};
    for (const g of s.templateGroups) {
      groups[g.name] = g.members
        .map((m) => (m.student_id ? roster.get(m.student_id) : null))
        .filter((x): x is Student => Boolean(x));
      groupIds[g.name] = g.id;
      if (g.faculty_lead_id) facultyLeads[g.name] = g.faculty_lead_id;
    }
    bySection[s.id] = { groups, groupIds, facultyLeads, nameAliases: {} };
  }
  return {
    bySection,
    unassigned: Array.from(roster.values()).filter((s) => !assigned.has(s.id)),
  };
}

export function CourseGroupsLiveProvider({
  courseId,
  sections,
  children,
}: {
  courseId: string;
  sections: CourseEditSection[];
  children: ReactNode;
}) {
  const boot = useMemo(() => bootFromSections(sections), [sections]);
  const [bySection, setBySection] = useState(boot.bySection);
  const [unassigned, setUnassigned] = useState(boot.unassigned);
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  useEffect(() => {
    setBySection(boot.bySection);
    setUnassigned(boot.unassigned);
  }, [boot]);
  useEffect(() => {
    Promise.all([getAllFacultyUsers(), getAllAdminUsers()]).then(([faculty, admins]) => {
      setFacultyMembers([...(faculty ?? []), ...(admins ?? [])]);
    });
  }, []);
  return (
    <LiveGroupsContext.Provider
      value={{ courseId, unassigned, setUnassigned, bySection, setBySection, facultyMembers }}
    >
      {children}
    </LiveGroupsContext.Provider>
  );
}

export function useCourseGroupsLive() {
  const live = useContext(LiveGroupsContext);
  if (!live) throw new Error("CourseGroupsLiveProvider required");
  return live;
}

export default function SectionGroupsEditor({ section }: { section: CourseEditSection }) {
  const live = useCourseGroupsLive();
  const { courseId, unassigned, setUnassigned, bySection, setBySection, facultyMembers } = live;
  const draft = bySection[section.id] ?? {
    groups: {},
    groupIds: {},
    facultyLeads: {},
    nameAliases: {},
  };
  const { groups, groupIds, facultyLeads, nameAliases } = draft;

  const patch = (next: SectionDraft) =>
    setBySection((prev) => ({ ...prev, [section.id]: next }));

  const [expanded, setExpanded] = useState(false);
  const [groupSize, setGroupSize] = useState(4);
  const [draggedStudent, setDraggedStudent] = useState<{
    student: Student;
    fromGroup: string;
    fromSection: string;
  } | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);

  const handleRandomAssign = () => {
    const all = [...unassigned, ...Object.values(groups).flat()];
    if (all.length === 0) return;
    patch({ groups: randomlyAssignGroups(all, groupSize), groupIds: {}, facultyLeads: {}, nameAliases });
    setUnassigned([]);
  };

  const handleUnassignAll = () => {
    setUnassigned((prev) => [...prev, ...Object.values(groups).flat()]);
    patch({ groups: {}, groupIds: {}, facultyLeads: {}, nameAliases });
  };

  const handleAddGroup = () => {
    const existing = Object.keys(groups);
    let name = "Group A";
    for (let i = 0; i < 702; i++) {
      const candidate = generateGroupNames(i + 1)[i];
      if (!existing.includes(candidate)) {
        name = candidate;
        break;
      }
    }
    patch({ groups: { ...groups, [name]: [] }, groupIds, facultyLeads, nameAliases });
  };

  const handleRenameGroup = (_s: string, oldName: string, newName: string) => {
    if (groups[newName] !== undefined) return;
    const nextGroups = { ...groups, [newName]: groups[oldName] };
    delete nextGroups[oldName];
    const nextIds = { ...groupIds };
    if (nextIds[oldName]) {
      nextIds[newName] = nextIds[oldName];
      delete nextIds[oldName];
    }
    const nextLeads = { ...facultyLeads };
    if (nextLeads[oldName]) {
      nextLeads[newName] = nextLeads[oldName];
      delete nextLeads[oldName];
    }
    patch({
      groups: nextGroups,
      groupIds: nextIds,
      facultyLeads: nextLeads,
      nameAliases: { ...nameAliases, [oldName]: newName },
    });
  };

  const handleDeleteGroup = (_s: string, groupName: string) => {
    setUnassigned((prev) => [...prev, ...(groups[groupName] ?? [])]);
    const nextGroups = { ...groups };
    delete nextGroups[groupName];
    const nextIds = { ...groupIds };
    delete nextIds[groupName];
    const nextLeads = { ...facultyLeads };
    delete nextLeads[groupName];
    patch({ groups: nextGroups, groupIds: nextIds, facultyLeads: nextLeads, nameAliases });
  };

  const handleDeleteStudent = async (student: Student) => {
    setUnassigned((prev) => prev.filter((s) => s.id !== student.id));
    setBySection((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([sectionId, draft]) => [
          sectionId,
          {
            ...draft,
            groups: Object.fromEntries(
              Object.entries(draft.groups).map(([groupName, students]) => [
                groupName,
                students.filter((s) => s.id !== student.id),
              ])
            ),
          },
        ])
      )
    );
    await removeStudentFromCourse(courseId, student.id);
  };

  const handleFacultyLeadChange = (_s: string, groupName: string, facultyId: string) => {
    const nextLeads = { ...facultyLeads };
    if (facultyId) nextLeads[groupName] = facultyId;
    else delete nextLeads[groupName];
    patch({ groups, groupIds, facultyLeads: nextLeads, nameAliases });
  };

  const handleDragStart = (
    e: React.DragEvent,
    student: Student,
    fromGroup?: string,
    fromSection?: string
  ) => {
    if (fromGroup && fromSection) {
      setDraggedStudent({ student, fromGroup, fromSection });
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragEnd = () => {
    setDraggedStudent(null);
    setDragOverGroup(null);
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string, groupName: string) => {
    e.preventDefault();
    setDragOverGroup(`${sectionId}::${groupName}`);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverGroup(null);
  };

  const handleDrop = (e: React.DragEvent, toGroup: string, toSection: string) => {
    e.preventDefault();
    if (!draggedStudent || draggedStudent.fromSection !== toSection) return;
    if (draggedStudent.fromGroup === toGroup) return;
    const { student, fromGroup } = draggedStudent;
    const nextGroups = { ...groups };
    if (fromGroup !== "__unassigned__") {
      nextGroups[fromGroup] = (nextGroups[fromGroup] ?? []).filter((s) => s.id !== student.id);
    }
    if (toGroup !== "__unassigned__") {
      nextGroups[toGroup] = [...(nextGroups[toGroup] ?? []), student];
    }
    patch({ groups: nextGroups, groupIds, facultyLeads, nameAliases });
    setUnassigned((prev) => {
      const without = prev.filter((s) => s.id !== student.id);
      return toGroup === "__unassigned__" ? [...without, student] : without;
    });
    setDraggedStudent(null);
    setDragOverGroup(null);
  };

  const scope = section.id;
  const isOverUnassigned = dragOverGroup === `${scope}::__unassigned__`;
  const totalAssigned = Object.values(groups).reduce((s, g) => s + g.length, 0);

  return (
    <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="cursor-pointer w-full flex items-center justify-between gap-2 px-4 py-3.5 bg-slate-50/60 hover:brightness-95 transition-all text-left"
      >
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span className="text-sm font-bold text-slate-800">Edit groups</span>
          <Badge variant="secondary" className="text-xs">
            {totalAssigned} assigned
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {unassigned.length} unassigned
          </Badge>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {expanded && (
        <div className="p-4 space-y-5">
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-slate-500 whitespace-nowrap">Group size</Label>
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setGroupSize((n) => Math.max(1, n - 1))}
                  className="h-8 w-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-medium text-sm"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-semibold text-slate-800">{groupSize}</span>
                <button
                  type="button"
                  onClick={() => setGroupSize((n) => Math.min(20, n + 1))}
                  className="h-8 w-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-medium text-sm"
                >
                  +
                </button>
              </div>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleRandomAssign} className="gap-1.5 h-8 text-xs">
              <Shuffle className="w-3.5 h-3.5" /> Randomly Assign
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleUnassignAll} className="gap-1.5 h-8 text-xs">
              <UserX className="w-3.5 h-3.5" /> Unassign All
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleAddGroup} className="gap-1.5 h-8 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Group
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0">
              {Object.keys(groups).length === 0 ? (
                <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-400 text-center px-4">
                    No groups yet — click &quot;Randomly Assign&quot; or &quot;Add Group&quot;
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {Object.entries(groups)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([groupName, students]) => (
                      <GroupCard
                        key={groupName}
                        groupName={groupName}
                        students={students}
                        sectionId={scope}
                        facultyMembers={facultyMembers}
                        facultyLead={facultyLeads[groupName] ?? ""}
                        onFacultyLeadChange={handleFacultyLeadChange}
                        draggedStudent={draggedStudent}
                        dragOverGroup={dragOverGroup}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onRenameGroup={handleRenameGroup}
                        onDeleteGroup={handleDeleteGroup}
                      />
                    ))}
                </div>
              )}
            </div>

            <div
              onDragOver={(e) => handleDragOver(e, scope, "__unassigned__")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "__unassigned__", scope)}
              className={`w-full lg:w-52 xl:w-56 flex-shrink-0 border-2 border-dashed rounded-lg p-3 transition-all ${
                isOverUnassigned ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Users2 className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs font-semibold text-slate-500">Unassigned</p>
                <Badge variant="secondary" className="text-xs ml-auto">
                  {unassigned.length}
                </Badge>
              </div>
              <div className="space-y-1.5">
                {unassigned.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">All assigned!</p>
                )}
                {[...unassigned]
                  .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""))
                  .map((student) => (
                    <StudentBlock
                      key={student.id}
                      student={student}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDimmed={draggedStudent?.student.id === student.id}
                      fromGroup="__unassigned__"
                      fromSection={scope}
                      onDelete={handleDeleteStudent}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
