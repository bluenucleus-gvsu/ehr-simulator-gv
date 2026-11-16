"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircleIcon, CheckCircle2Icon, Download, X, UploadIcon } from "lucide-react";
import { User } from "lucide-react";
import { toast } from "sonner";
import { Student } from "./courseForm";
import UnassignDialog from "./unassignDialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

interface AddStudentProps {
  onAddStudent: (student: Student) => void;
  onImportStudents?: (students: Student[]) => void;
  onClearStudents?: () => void;
  clearConfirm?: { title: string; description?: string; confirmText?: string };
}

export default function AddStudent({ onAddStudent, onImportStudents, onClearStudents, clearConfirm }: AddStudentProps) {
  const [username, setUsername] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fileUploadError, setFileUploadError] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): { students: Student[]; skipped: number } => {
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

    const students: Student[] = [];
    const seenEmails = new Set<string>();
    let skipped = 0;

    for (const line of rows.slice(1)) {
      const values = splitLine(line).map((v) => v.replace(/"/g, "").trim());
      const cell = (idx: number) => (idx === -1 ? "" : values[idx] ?? "");

      const fullName = fullNameIdx !== -1 ? cell(fullNameIdx) : `${cell(firstIdx)} ${cell(lastIdx)}`.trim();

      const email = emailIdx !== -1 && cell(emailIdx)
        ? cell(emailIdx)
        : cell(usernameIdx)
          ? `${cell(usernameIdx)}@mail.gvsu.edu`
          : "";

      if (!email || seenEmails.has(email)) {
        skipped += 1;
        continue;
      }
      seenEmails.add(email);
      students.push({ id: crypto.randomUUID(), email, full_name: fullName });
    }

    return { students, skipped };
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
        const { students, skipped } = parseCSV(event.target?.result as string);
        onImportStudents?.(students);
        setSelectedFile(file);
        setFileUploadError("");
        setTotalStudents(students.length);
        if (skipped > 0) {
          toast.warning(`${skipped} row${skipped === 1 ? "" : "s"} skipped: missing or duplicate email.`);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to parse CSV file.";
        setFileUploadError(message);
        setSelectedFile(undefined);
        setTotalStudents(0);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const csv = "email,first name,last name\nstudent@example.edu,Jane,Doe\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-import-template.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
    };

    onAddStudent(newStudent);

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
        <CardDescription>Upload students from a file or add them manually</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full gap-4">
          <div className="flex items-end gap-4">
            <div >
              {fileUploadError && (
                <div className="flex gap-2 items-center">
                  <AlertCircleIcon className="text-red-600 size-4" />
                  <p className="text-sm text-red-600">Upload failed: {fileUploadError}</p>
                </div>
              )}
              {selectedFile && !fileUploadError && (
                <div className="flex gap-2 items-center">
                  <CheckCircle2Icon className="size-4 text-green-600" />
                  <p className="text-green-600 text-sm">
                    Success! {totalStudents} students loaded from file
                  </p>
                </div>
              )}
              <InputGroup className="max-w-sm mt-1">
                <InputGroupInput ref={fileInputRef}
                  onChange={handleFileChange}
                  type="file"
                  accept=".csv"
                  className="mt-2 cursor-pointer" />
                <InputGroupAddon>
                  <UploadIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
              className="cursor-pointer gap-1.5 shrink-0"
            >
              <Download /> Download template
            </Button>
            {totalStudents > 0 &&
              <div>
                {clearConfirm ? (
                  <UnassignDialog
                    title={clearConfirm.title}
                    description={clearConfirm.description}
                    confirmText={clearConfirm.confirmText}
                    onConfirm={handleClear}
                    trigger={
                      <Button className="cursor-pointer w-full" variant="secondary">
                        <X /> Clear All Students
                      </Button>
                    }
                  />
                ) : (
                  <Button className="cursor-pointer w-full" variant="secondary" onClick={handleClear}>
                    <X /> Clear All Students
                  </Button>
                )}
              </div>}
          </div>
          <div>
            <form onSubmit={handleSubmit} className="flex flex-row gap-2">
              <Input
                placeholder="Username"
                className="cursor-pointer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                placeholder="First name"
                className="cursor-pointer"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                required
              />
              <Input
                placeholder="Last name"
                className="cursor-pointer"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                required
              />
              <Button type="submit" className="cursor-pointer shrink-0">
                <User className="mr-2 h-4 w-4" /> Add
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}