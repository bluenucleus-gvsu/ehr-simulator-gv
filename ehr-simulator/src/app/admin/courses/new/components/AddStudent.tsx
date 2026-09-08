"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircleIcon, CheckCircle2Icon, X } from "lucide-react";
import { User } from "lucide-react";
import { toast } from "sonner";
import { Student } from "../types";

interface AddStudentProps {
  onAddStudent: (student: Student) => void;
  onImportStudents?: (students: Student[]) => void;
  onClearStudents?: () => void;
}

export default function AddStudent({ onAddStudent, onImportStudents, onClearStudents }: AddStudentProps) {
  const [username, setUsername] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fileUploadError, setFileUploadError] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Student[] => {
    const splitLine = (line: string) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else current += char;
      }
      values.push(current.trim());
      return values;
    };

    const rows = text.trim().split("\n").filter((line) => line.trim());
    if (rows.length < 2) throw new Error("CSV file is empty or contains only headers");

    const header = splitLine(rows[0]).map((h) => h.replace(/"/g, "").trim().toLowerCase());
    const colIndex = (...aliases: string[]) => aliases.map((a) => header.indexOf(a)).find((i) => i !== -1) ?? -1;

    const emailIdx = colIndex("email", "email address", "e-mail");
    const usernameIdx = colIndex("user name", "username", "user");
    const firstIdx = colIndex("first name", "first");
    const lastIdx = colIndex("last name", "last");
    const fullNameIdx = colIndex("name", "full name", "student name");

    if (emailIdx === -1 && usernameIdx === -1) throw new Error("Missing columns: Email or User Name");
    if (fullNameIdx === -1 && firstIdx === -1 && lastIdx === -1) throw new Error("Missing columns: Name, or First Name/Last Name");

    return rows.slice(1).map((line) => {
      const values = splitLine(line).map((v) => v.replace(/"/g, "").trim());
      const cell = (idx: number) => (idx === -1 ? "" : values[idx] ?? "");

      const email = emailIdx !== -1 ? cell(emailIdx) : `${cell(usernameIdx)}@mail.gvsu.edu`;
      const fullName = fullNameIdx !== -1 ? cell(fullNameIdx) : `${cell(firstIdx)} ${cell(lastIdx)}`.trim();

      return {
        id: crypto.randomUUID(),
        email,
        full_name: fullName,
        role: "student",
        status: null,
        created_at: null,
        updated_at: null,
      } satisfies Student;
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.split(".").pop()?.toLowerCase() !== "csv") {
      setFileUploadError(`Expected .csv, received .${file.name.split(".").pop()}`);
      setSelectedFile(undefined);
      setTotalStudents(0);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const students = parseCSV(event.target?.result as string);
        onImportStudents?.(students);
        setSelectedFile(file);
        setFileUploadError("");
        setTotalStudents(students.length);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to parse CSV file.";
        setFileUploadError(message);
        setSelectedFile(undefined);
        setTotalStudents(0);
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setSelectedFile(undefined);
    setFileUploadError("");
    setTotalStudents(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClearStudents?.();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanUsername = username.trim();
    const cleanFirst = first.trim();
    const cleanLast = last.trim();

    if (!cleanUsername || !cleanFirst || !cleanLast) {
      toast.error("All fields are required.");
      return;
    }

    const newStudent: Student = {
      id: crypto.randomUUID(),
      email: `${cleanUsername}@mail.gvsu.edu`,
      full_name: `${cleanFirst} ${cleanLast}`,
      role: "student",
      status: null,
      created_at: null,
      updated_at: null,
    };

    onAddStudent(newStudent);

    toast.success("Added Student to Unassigned");

    setUsername("");
    setFirst("");
    setLast("");
  };

  return (
    <Card className="pt-4">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="size-5 text-blue-600" /> Add Students
            </CardTitle>
            <CardDescription>Upload course students information file or add a student manually</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col w-full gap-2">
                <div className="flex gap-2">
                    <Input
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    type="file"
                    accept=".csv"
                    className="pt-2 cursor-pointer"
                    />
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
                        Success! {totalStudents} students loaded from <span className="font-mono">{selectedFile.name}</span>
                    </AlertTitle>
                    </Alert>
                )}
                <div>
                    <form onSubmit={handleSubmit} className="flex flex-row gap-2">
                        <Input
                            placeholder="username"
                            className="pt-2 cursor-pointer"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Input
                            placeholder="first"
                            className="pt-2 cursor-pointer"
                            value={first}
                            onChange={(e) => setFirst(e.target.value)}
                            required
                        />
                        <Input
                            placeholder="last"
                            className="pt-2 cursor-pointer"
                            value={last}
                            onChange={(e) => setLast(e.target.value)}
                            required
                        />
                        <Button type="submit" className="cursor-pointer flex-shrink-0">
                            <User className="mr-2 h-4 w-4" /> Add
                        </Button>
                    </form>
                </div>
                <div>
                    <Button className="cursor-pointer w-full" variant="secondary" onClick={handleClear}>
                    <X /> Clear All Students
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}