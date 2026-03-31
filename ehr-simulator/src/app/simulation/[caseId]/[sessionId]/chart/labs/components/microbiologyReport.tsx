import {
  OctagonAlert,
  TestTube2,
  Microscope,
  FileText,
  Pill,
  TriangleAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MicrobiologyReportData } from "./labsData";

interface PathologyReportProps {
  cellLabel: string;
  report: MicrobiologyReportData;
  displayTime: string;
  displayDate: string;
}


export default function MicrobiologyReport({
  report,
  cellLabel,
  displayTime,
  displayDate
}: PathologyReportProps) {

  const isCritical = report.isCritical === true;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full text-left text-xs hover:underline hover:text-blue-600 font-medium truncate transition-colors flex items-center justify-center gap-2 px-1">
          <FileText size={14} />
          {cellLabel}
          {isCritical && <TriangleAlert size={14} className="text-red-600" />}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl md:max-w-3/4 xl:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 bg-white rounded">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-start justify-between pr-8">
            <div>
              <div className="flex items-center gap-4 mb-1">
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  {report.sampleType}
                </DialogTitle>

              </div>
              <div className="flex gap-4 text-xs text-slate-500 font-medium font-mono">
                <p>Specimen: <span className="text-slate-700">#{Math.floor(Math.random() * 900000) + 10000}</span></p>
                <p>Status: <span className="text-slate-700">Final Report</span></p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-8 py-4 space-y-6">
            {isCritical && (
              <div className="bg-red-50 border border-red-100 rounded-md p-3 flex items-start gap-3">
                <OctagonAlert className="text-red-600 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-red-800">Critical Organism Detected</h4>
                </div>
              </div>
            )}

            <section className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Microscope size={14} className="text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Microscopy</h3>
                </div>
                <p className="text-sm font-medium text-slate-800">{report.microscopy}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Specimen Appearance</h3>
                </div>
                <p className="text-sm font-medium text-slate-800">{report.appearance}</p>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 flex items-center gap-2">
                <TestTube2 className="text-slate-900" size={16} />
                Culture Results
              </h3>
              <div className="pl-2 pt-1">
                <p className="text-sm text-slate-900">{report.cultureResults}</p>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1 flex items-center gap-2">
                <Pill size={16} className="text-slate-900" />
                Antibiotic Susceptibility
              </h3>
              <div className="pl-2">
                <p className="text-sm pt-1">{report.sensitivity}</p>
                <div className="mt-2 flex gap-4 text-[10px] text-slate-400 font-medium uppercase">
                  <span>(S) = Sensitive</span>
                  <span>(I) = Intermediate</span>
                  <span>(R) = Resistant</span>
                </div>
              </div>
            </section>

            <section className="bg-yellow-50/50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-700 mb-1">Lab Comments</h3>
              <p className="text-sm text-slate-700 italic">
                &quot;{report.comments}&quot;
              </p>
            </section>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-mono flex gap-2">
                <span>Reported by: AC, Microbiology Lab – KCON Sim Center</span>
                <span className="font-medium">{displayDate}/{new Date().getFullYear()} {displayTime}</span>
              </p>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}