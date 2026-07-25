"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ManualStudentInput = {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  full_name: string;
};

export function buildStudentFromFields(
  userName: string,
  firstName: string,
  lastName: string
): ManualStudentInput | null {
  const trimmedUser = userName.trim();
  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();
  if (!trimmedUser || !trimmedFirst || !trimmedLast) return null;

  return {
    userName: trimmedUser,
    firstName: trimmedFirst,
    lastName: trimmedLast,
    email: `${trimmedUser}@mail.gvsu.edu`,
    full_name: `${trimmedFirst} ${trimmedLast}`,
  };
}

type Props = {
  onAdd: (student: ManualStudentInput) => void | Promise<void>;
  disabled?: boolean;
  submitLabel?: string;
};

export default function AddStudentForm({
  onAdd,
  disabled = false,
  submitLabel = "Add Student",
}: Props) {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = buildStudentFromFields(userName, firstName, lastName);
    if (!student) {
      setError("User name, first name, and last name are required.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onAdd(student);
      setUserName("");
      setFirstName("");
      setLastName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add student.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = disabled || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="student-user-name" className="text-sm text-slate-600">
            User Name
          </Label>
          <Input
            id="student-user-name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. smithj"
            disabled={busy}
            autoComplete="off"
          />
          <p className="text-xs text-slate-400">Becomes {userName.trim() || "username"}@mail.gvsu.edu</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="student-first-name" className="text-sm text-slate-600">
            First Name
          </Label>
          <Input
            id="student-first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Jane"
            disabled={busy}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="student-last-name" className="text-sm text-slate-600">
            Last Name
          </Label>
          <Input
            id="student-last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Smith"
            disabled={busy}
            autoComplete="off"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" variant="secondary" size="sm" disabled={busy}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Plus className="h-4 w-4 mr-1" />
        )}
        {submitLabel}
      </Button>
    </form>
  );
}
