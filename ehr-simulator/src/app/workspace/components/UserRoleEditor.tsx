"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/actions/userManagement";
import { roleLabels, userRoles, type ManagedUser, type UserRole } from "@/lib/userManagement";
import { Button } from "@/components/ui/button";

export function UserRoleEditor({ user }: { user: ManagedUser }) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return <div className="space-y-1">
    <div className="flex items-center gap-2">
      <select aria-label={`Role for ${user.full_name || user.email}`} value={role} disabled={pending}
        className="h-9 rounded-md border bg-background px-2 text-sm"
        onChange={event => { setRole(event.target.value as UserRole); setError(""); }}>
        {userRoles.map(value => <option key={value} value={value}>{roleLabels[value]}</option>)}
      </select>
      <Button size="sm" disabled={pending || role === user.role} onClick={() => startTransition(async () => {
        setError("");
        try {
          const result = await updateUserRole(user.id, role);
          if (!result.success) { setError(result.error); return; }
          router.refresh();
        } catch { setError("Unable to save role. Please try again."); }
      })}>{pending ? "Saving…" : "Save"}</Button>
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
