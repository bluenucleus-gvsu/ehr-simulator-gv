"use client"

import { useState } from "react";
import CaseListItem from "./CaseListItem";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { CaseRow } from "@/types/db";
import { ChevronDown, Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { CaseSpecialty } from "@/lib/flexSheet/flexSheetTemplate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { caseSpecialtyLabels } from "@/utils/form";

interface CaseClientProps {
  cases: CaseRow[];
}

function filterCases(
  cases: CaseRow[],
  filterText: string,
  specialty: CaseSpecialty | ''
) {
  return cases.filter((item) => {
    const matchesName = filterText === "" || item.name.toLowerCase().includes(filterText.toLowerCase());
    const matchesSpecialty = specialty === item.case_specialty || specialty === '';

    return matchesName && matchesSpecialty
  });
}

export default function CasesClient({ cases }: CaseClientProps) {
  const [filterText, setFilterText] = useState('');
  const [specialty, setSpecialty] = useState<CaseSpecialty | ''>('');

  const handleFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  };
  const filteredAssignments = filterCases(cases, filterText, specialty);

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

        <InputGroup className="max-w-50">
          <InputGroupInput value={filterText} onChange={handleFilterTextChange} placeholder="Search case name..." />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end"></InputGroupAddon>
        </InputGroup>
        <Select
          required
          onValueChange={(value) => setSpecialty(value as CaseSpecialty)}
          value={specialty}
        >
          <SelectTrigger
            className=" bg-white"
            id="caseSpecialty"
          >
            <SelectValue placeholder="Case Specialty" />
            <ChevronDown />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key={'none'} value=''>All Specialties</SelectItem>
            {Object.entries(caseSpecialtyLabels).map(([value, label], i) => {
              return (
                <SelectItem key={i} value={value}>{label}</SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {
          filteredAssignments.length > 0 ? (
            filteredAssignments.map((simCase) => <CaseListItem key={simCase.id} courseCaseAssignment={simCase} />)

          ) : (
            <div className="flex justify-center items-center border border-dashed border-gray-300 rounded-md h-20">
              <p className=" font-semibold text-gray-300">No cases match your filters.</p>
            </div>
          )
        }
      </div>
    </div>
  );
}
