'use client'

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TemplateCase, updateCaseName } from "@/actions/cases";

interface TemplateListItemProps {
  template: TemplateCase;
}

export default function TemplateListItem({ template }: TemplateListItemProps) {
  const { id, description, admitting_diagnosis, created_at, creator_name } = template;

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(template.name);
  const [editName, setEditName] = useState(template.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  const startEdit = () => {
    setEditName(displayName);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditName(displayName);
  };

  const confirmEdit = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === displayName) {
      cancelEdit();
      return;
    }
    setSaving(true);
    await updateCaseName(id, trimmed);
    setDisplayName(trimmed);
    setIsEditing(false);
    setSaving(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") confirmEdit();
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <div className="border rounded-md p-4 border-l-10 border-l-emerald-600 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={saving}
                className="text-xl font-semibold h-9"
              />
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 text-emerald-600 hover:text-emerald-700"
                onClick={confirmEdit}
                disabled={saving}
                aria-label="Save name"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 text-gray-400 hover:text-gray-600"
                onClick={cancelEdit}
                disabled={saving}
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-xl font-semibold truncate">{displayName}</h2>
              <button
                onClick={startEdit}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                aria-label="Edit template name"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-md text-gray-600 mt-0.5">{admitting_diagnosis}</p>
          <div className="flex gap-4 mt-1 text-sm text-gray-400">
            <span>Creator: {creator_name ?? "System"}</span>
            {created_at && <span>Created: {format(created_at, "PP")}</span>}
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{description}</p>
          )}
        </div>
        <Link href={`/admin/case-builder/form/demographics?templateId=${id}`} className="shrink-0">
          <Button variant="outline" size="sm">
            Use Template
          </Button>
        </Link>
      </div>
    </div>
  );
}
