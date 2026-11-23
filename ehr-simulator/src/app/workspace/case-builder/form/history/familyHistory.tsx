'use client'
import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

export interface FamilyHistoryInputHandle {
  focus: () => void,
  hasText: () => boolean
}

export interface FamilyHistoryData {
  relation: string;
  condition: string;
}

interface FamilyHistoryProps {
  value: FamilyHistoryData[];
  onChange: (entries: FamilyHistoryData[]) => void;
}

const relations: string[] = [
  'Mother', 'Father', 'Brother', 'Sister',
  'Paternal Grandmother', 'Paternal Grandfather', 'Paternal Aunt', 'Paternal Uncle', 'Paternal Cousin',
  'Maternal Grandmother', 'Maternal Grandfather', 'Maternal Aunt', 'Maternal Uncle', 'Maternal Cousin',
];

export const FamilyHistory = forwardRef<FamilyHistoryInputHandle, FamilyHistoryProps>(({
  value,
  onChange
}, ref) => {
  const [relation, setRelation] = useState('');
  const [condition, setCondition] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    hasText: () => condition.trim().length > 0,
  }))

  // Ref to focus back on the select after adding
  const selectTriggerRef = useRef<HTMLButtonElement>(null);

  const addEntry = (): void => {
    if (!relation || !condition) return; // Prevent empty adds

    const newEntry: FamilyHistoryData = { relation, condition };
    onChange([...value, newEntry]);

    // Reset fields
    setRelation('');
    setCondition('');
    // Optional: Focus back for rapid entry
    // selectTriggerRef.current?.focus(); 
  };

  const deleteEntry = (index: number): void => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="space-y-1 flex-1 w-full">
          <label className="text-xs font-medium text-slate-500">Relation</label>
          <Select value={relation} onValueChange={setRelation}>
            <SelectTrigger ref={selectTriggerRef} className="bg-white h-9">
              <SelectValue placeholder="Select..." />
              <ChevronDown />
            </SelectTrigger>
            <SelectContent>
              {relations.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 flex-[2] w-full">
          <label className="text-xs font-medium text-slate-500">Condition / Disease</label>
          <Input
            ref={inputRef}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g. Type 2 Diabetes, Hypertension"
            className="bg-white h-9"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEntry())}
          />
        </div>

        <Button
          type="button"
          onClick={addEntry}
          disabled={!relation || !condition}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-fit"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {/* Results List */}
      {value.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableBody>
              {value.map((item, index) => ({ item, index }))
                .sort((a, b) => a.item.relation.localeCompare(b.item.relation))
                .map(({ item, index }) => (
                  <TableRow key={index} className="hover:bg-slate-50">
                    <TableCell className="font-medium w-1/3 py-2">{item.relation}</TableCell>
                    <TableCell className="py-2 text-slate-600">{item.condition}</TableCell>
                    <TableCell className="text-right py-2 w-12">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer h-6 w-6 text-slate-400 hover:text-red-600"
                        onClick={() => deleteEntry(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic pl-1">No family history recorded.</p>
      )}
    </div>
  );
})