"use client"

import { useState } from "react";
import CaseListItem from "./CaseListItem";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CaseCourseAssignments } from "@/actions/cases";
import { Course } from "../courses/[id]/page";
import { ChevronDown, Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

interface CaseClientProps {
  courses: Course[];
  caseAssignments: CaseCourseAssignments;
}

function filterCases(
  cases: CaseCourseAssignments,
  filterText: string,
  selectedCourse: string,
  // selectedSpecialty: string
) {
  return cases.filter((item) => {
    const matchesCourse = selectedCourse === "all" || item.courseId === selectedCourse || selectedCourse == 'unassigned' && item.courseCode === null;
    // const matchesSpecialty = selectedSpecialty === "all" || item.specialty === selectedSpecialty;
    const matchesText = filterText === "" || item.caseName.toLowerCase().includes(filterText.toLowerCase());

    return matchesCourse && matchesText
    // && matchesSpecialty;
  });
}

// const specialties = [{ id: 'OB', value: 'OB' }, { id: 'Med-Surg', value: 'Med-Surg' }, { id: 'Mental Health', value: 'Mental Health' }, { id: 'Home Health', value: 'Home Health' }]

export default function CasesClient({ courses, caseAssignments }: CaseClientProps) {
  const [filterText, setFilterText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  // const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

  const handleFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  };
  const filteredAssignments = filterCases(caseAssignments, filterText, selectedCourse);

  return (
    <div className="w-full">
      <header className="bg-white border-b px-8 py-4 pb-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-5xl font-bold tracking-tight">CASES</h1>

            <p className="text-xs text-gray-500">Manage all simulation cases</p>
          </div>
          <Link href='/admin/case-builder/form/demographics'>
            <Button>Create Case</Button>
          </Link>
        </div>
      </header>

      <div className="flex gap-4 pt-2 px-2">
        <Select onValueChange={setSelectedCourse} value={selectedCourse}>
          <SelectTrigger className="w-fit">
            <SelectValue placeholder="Select a course" />
            <ChevronDown />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Courses</SelectLabel>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value='unassigned'>Unassigned</SelectItem>
              {
                courses.map(course => (
                  <SelectItem
                    key={course.id}
                    value={course.id}
                  >
                    {course.code}
                  </SelectItem>
                ))
              }
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* <Select onValueChange={setSelectedSpecialty} value={selectedSpecialty}>
          <SelectTrigger className="w-fit">
            <SelectValue placeholder="Select a specialty" />
            <ChevronDown />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Specialties</SelectLabel>
              <SelectItem value="all">All Specialties</SelectItem>
              {
                specialties.map(item => (
                  <SelectItem
                    key={item.id}
                    value={item.id}
                  >
                    {item.value}
                  </SelectItem>
                ))
              }
            </SelectGroup>
          </SelectContent>
        </Select> */}
        <InputGroup className="max-w-50">
          <InputGroupInput value={filterText} onChange={handleFilterTextChange} placeholder="Search case name..." />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end"></InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {
          filteredAssignments.length > 0 ? (
            filteredAssignments.map((simCase) => <CaseListItem key={simCase.id} courseCaseAssignment={simCase} />)

          ) : (
            <div className="flex justify-center items-center border border-dashed border-gray-300 rounded-md h-20">
              <p className=" font-semibold text-gray-300">No cases assigned to this course</p>
            </div>
          )
        }
      </div>
    </div>
  );
}
