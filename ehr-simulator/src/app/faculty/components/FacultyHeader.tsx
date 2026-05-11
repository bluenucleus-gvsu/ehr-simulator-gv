"use client";
import React from "react";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";

type Props = {
  name: string;
  avatarUrl?: string;
  courses?: string[];
};

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function FacultyHeader({ name, avatarUrl, courses = [] }: Props) {
  const initials = initialsFromName(name || "");

  return (
    <header className="flex items-center justify-between bg-white shadow-sm rounded-lg p-4">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`${name} avatar`}
            width={64}
            height={64}
            className="rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-lg font-semibold text-blue-700">
            {initials}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{name}</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              Faculty
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {courses.length > 0 ? courses.join(", ") : "No courses assigned"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
          onClick={async () => {
            try {
              const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              );
              await supabase.auth.signOut();
            } catch {
              // ignore sign out errors
            } finally {
              try {
                if (typeof window !== "undefined") window.localStorage.removeItem("role");
              } catch {}
              window.location.href = "/auth/login";
            }
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
