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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CourseEditSection, removeStudentFromCourse } from "@/actions/courses";
import { GroupCard } from "../../new/GroupCard";
import { StudentBlock } from "../../new/StudentBlock";
import { generateGroupNames, randomlyAssignGroups, SectionGroups } from "../../new/SectionCard";
import type { FacultyMember, Student } from "../../new/types";
import { getAllAdminUsers, getAllFacultyUsers } from "@/actions/users";

type Draft = {
  groups: SectionGroups;
  groupIds: Record<string, string>;
  facultyLeads: Record<string, string>;
  nameAliases: Record<string, string>;
};

const EMPTY: Draft = { groups: {}, groupIds: {}, facultyLeads: {}, nameAliases: {} };

type Live = {
  courseId: string;
  unassigned: Student[];
  setUnassigned: Dispatch<SetStateAction<Student[]>>;
  bySection: Record<string, Draft>;
  setBySection: Dispatch<SetStateAction<Record<string, Draft>>>;
  facultyMembers: FacultyMember[];
};

const Ctx = createContext<Live | null>(null);

const toStudent = (id: string, full_name: string | null, email: string | null): Student => ({
  id,
  full_name,
  email: email ?? id,
  role: "student",
  is_active: true,
});

const renameKey = <T,>(map: Record<string, T>, from: string, to: string) => {
  if (!(from in map)) return map;
  const next = { ...map, [to]: map[from] };
  delete next[from];
  return next;
};

const dropKey = <T,>(map: Record<string, T>, key: string) => {
  const next = { ...map };
  delete next[key];
  return next;
};

function boot(sections: CourseEditSection[]) {
  const roster = new Map<string, Student>();
  const assigned = new Set<string>();
  for (const s of sections) {
    for (const e of s.enrollments) {
      if (e.active && e.student_id) {
        roster.set(e.student_id, toStudent(e.student_id, e.student?.full_name ?? null, e.student?.email ?? null));
      }
    }
    for (const g of s.templateGroups) {
      for (const m of g.members) {
        if (!m.student_id) continue;
        assigned.add(m.student_id);
        if (!roster.has(m.student_id)) {
          roster.set(m.student_id, toStudent(m.student_id, m.student?.full_name ?? null, m.student?.email ?? null));
        }
      }
    }
  }
  const bySection: Record<string, Draft> = {};
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
  return { bySection, unassigned: [...roster.values()].filter((s) => !assigned.has(s.id)) };
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
  const initial = useMemo(() => boot(sections), [sections]);
  const [bySection, setBySection] = useState(initial.bySection);
  const [unassigned, setUnassigned] = useState(initial.unassigned);
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  useEffect(() => {
    setBySection(initial.bySection);
    setUnassigned(initial.unassigned);
  }, [initial]);
  useEffect(() => {
    Promise.all([getAllFacultyUsers(), getAllAdminUsers()]).then(([f, a]) =>
      setFacultyMembers([...(f ?? []), ...(a ?? [])])
    );
  }, []);
  return (
    <Ctx.Provider value={{ courseId, unassigned, setUnassigned, bySection, setBySection, facultyMembers }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCourseGroupsLive() {
  const live = useContext(Ctx);
  if (!live) throw new Error("CourseGroupsLiveProvider required");
  return live;
}

export default function SectionGroupsEditor({ section }: { section: CourseEditSection }) {
  const { courseId, unassigned, setUnassigned, bySection, setBySection, facultyMembers } =
    useCourseGroupsLive();
  const { groups, groupIds, facultyLeads, nameAliases } = bySection[section.id] ?? EMPTY;
  const patch = (next: Draft) => setBySection((p) => ({ ...p, [section.id]: next }));

  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(4);
  const [drag, setDrag] = useState<{ student: Student; fromGroup: string; fromSection: string } | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const startDrag = (e: React.DragEvent, student: Student, fromGroup?: string, fromSection?: string) => {
    if (!fromGroup || !fromSection) return;
    setDrag({ student, fromGroup, fromSection });
    e.dataTransfer.effectAllowed = "move";
  };
  const clearDrag = () => {
    setDrag(null);
    setOver(null);
  };
  const onOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setOver(key);
  };
  const onLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null);
  };

  const drop = (e: React.DragEvent, toGroup: string, toSection: string) => {
    e.preventDefault();
    if (!drag || drag.fromSection !== toSection || drag.fromGroup === toGroup) return;
    const { student, fromGroup } = drag;
    const next = { ...groups };
    if (fromGroup !== "__unassigned__") {
      next[fromGroup] = (next[fromGroup] ?? []).filter((s) => s.id !== student.id);
    }
    if (toGroup !== "__unassigned__") next[toGroup] = [...(next[toGroup] ?? []), student];
    patch({ groups: next, groupIds, facultyLeads, nameAliases });
    setUnassigned((p) => {
      const without = p.filter((s) => s.id !== student.id);
      return toGroup === "__unassigned__" ? [...without, student] : without;
    });
    clearDrag();
  };

  const scope = section.id;
  const assigned = Object.values(groups).reduce((n, g) => n + g.length, 0);

  return (
    <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer w-full flex items-center justify-between gap-2 px-4 py-3.5 bg-slate-50/60 hover:brightness-95 text-left"
      >
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span className="text-sm font-bold text-slate-800">Edit groups</span>
          <Badge variant="secondary" className="text-xs">
            {assigned} assigned
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {unassigned.length} unassigned
          </Badge>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {open && (
        <div className="p-4 space-y-5">
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-slate-500">Group size</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={size}
                onChange={(e) => setSize(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
                className="h-8 w-16"
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                const all = [...unassigned, ...Object.values(groups).flat()];
                if (!all.length) return;
                patch({
                  groups: randomlyAssignGroups(all, size),
                  groupIds: {},
                  facultyLeads: {},
                  nameAliases,
                });
                setUnassigned([]);
              }}
            >
              <Shuffle className="w-3.5 h-3.5" /> Randomly Assign
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                setUnassigned((p) => [...p, ...Object.values(groups).flat()]);
                patch({ ...EMPTY, nameAliases });
              }}
            >
              <UserX className="w-3.5 h-3.5" /> Unassign All
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                const existing = Object.keys(groups);
                let name = "Group A";
                for (let i = 0; i < 702; i++) {
                  const c = generateGroupNames(i + 1)[i];
                  if (!existing.includes(c)) {
                    name = c;
                    break;
                  }
                }
                patch({ groups: { ...groups, [name]: [] }, groupIds, facultyLeads, nameAliases });
              }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Group
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0">
              {!Object.keys(groups).length ? (
                <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-400 px-4 text-center">
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
                        onFacultyLeadChange={(_s, g, id) => {
                          const next = { ...facultyLeads };
                          if (id) next[g] = id;
                          else delete next[g];
                          patch({ groups, groupIds, facultyLeads: next, nameAliases });
                        }}
                        draggedStudent={drag}
                        dragOverGroup={over}
                        onDragStart={startDrag}
                        onDragEnd={clearDrag}
                        onDragOver={(e, sid, g) => onOver(e, `${sid}::${g}`)}
                        onDragLeave={onLeave}
                        onDrop={drop}
                        onRenameGroup={(_s, oldName, newName) => {
                          if (groups[newName] !== undefined) return;
                          const nextGroups = { ...groups, [newName]: groups[oldName] };
                          delete nextGroups[oldName];
                          patch({
                            groups: nextGroups,
                            groupIds: renameKey(groupIds, oldName, newName),
                            facultyLeads: renameKey(facultyLeads, oldName, newName),
                            nameAliases: { ...nameAliases, [oldName]: newName },
                          });
                        }}
                        onDeleteGroup={(_s, groupName) => {
                          setUnassigned((p) => [...p, ...(groups[groupName] ?? [])]);
                          patch({
                            groups: dropKey(groups, groupName),
                            groupIds: dropKey(groupIds, groupName),
                            facultyLeads: dropKey(facultyLeads, groupName),
                            nameAliases,
                          });
                        }}
                      />
                    ))}
                </div>
              )}
            </div>

            <div
              onDragOver={(e) => onOver(e, `${scope}::__unassigned__`)}
              onDragLeave={onLeave}
              onDrop={(e) => drop(e, "__unassigned__", scope)}
              className={`w-full lg:w-52 xl:w-56 flex-shrink-0 border-2 border-dashed rounded-lg p-3 ${
                over === `${scope}::__unassigned__` ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50/50"
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
                {!unassigned.length && (
                  <p className="text-xs text-slate-400 italic text-center py-4">All assigned!</p>
                )}
                {[...unassigned]
                  .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""))
                  .map((student) => (
                    <StudentBlock
                      key={student.id}
                      student={student}
                      onDragStart={startDrag}
                      onDragEnd={clearDrag}
                      isDimmed={drag?.student.id === student.id}
                      fromGroup="__unassigned__"
                      fromSection={scope}
                      onDelete={async (s) => {
                        setUnassigned((p) => p.filter((x) => x.id !== s.id));
                        setBySection((prev) =>
                          Object.fromEntries(
                            Object.entries(prev).map(([id, d]) => [
                              id,
                              {
                                ...d,
                                groups: Object.fromEntries(
                                  Object.entries(d.groups).map(([n, list]) => [
                                    n,
                                    list.filter((x) => x.id !== s.id),
                                  ])
                                ),
                              },
                            ])
                          )
                        );
                        await removeStudentFromCourse(courseId, s.id);
                      }}
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
