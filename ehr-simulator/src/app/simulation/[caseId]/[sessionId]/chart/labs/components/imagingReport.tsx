import type { ImagingData } from "./labsData"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ImagingReportProps {
  cellName: string;
  imagingReportContents: ImagingData;
  displayTime: string;
  displayDate: string;
}

const ImagingReport = ({
  imagingReportContents,
  cellName,
  displayDate,
  displayTime

}: ImagingReportProps) => {

  const isCritical = imagingReportContents.isCritical === true;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full text-center text-xs hover:underline hover:text-blue-600 font-medium truncate transition-colors flex items-center gap-2 justify-center">
          <FileText size={14} />
          {cellName}
          {isCritical && <AlertTriangle size={14} className="text-red-600" />}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl md:max-w-3/4 xl:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 bg-white rounded-lg">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50 flex flex-row items-start justify-between rounded-lg">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <DialogTitle className="text-xl font-semibold text-slate-900">
                {imagingReportContents.displayName}
              </DialogTitle>
              {isCritical && (
                <Badge variant="destructive" className="text-[10px] px-1.5 h-5">Critical</Badge>
              )}
            </div>
            <div className="flex gap-4 text-xs text-slate-500 font-medium">
              <p>Status: <span className="text-slate-700">Finalized</span></p>
              <p>Modality: <span className="text-slate-700">CT</span></p>
              <p>Scan ID: <span className="text-slate-700">#{Math.floor(Math.random() * 1000000)}</span></p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-8 py-6 space-y-8">

            <section>
              <h3 className="text-md font-bold uppercase tracking-wider text-slate-900 mb-2">Procedure & Technique</h3>
              <p className="text-sm leading-relaxed border-l-2 border-slate-300 pl-3">
                {imagingReportContents.technique}
              </p>
            </section>

            <section>
              <h3 className="text-md font-bold uppercase tracking-wider text-slate-900 mb-3">Detailed Findings</h3>
              <div className="grid grid-cols-1 gap-y-2 pl-2">
                {imagingReportContents.findings.map((item, index) => (
                  <div key={index} className="grid grid-cols-[100px_auto] gap-1 text-sm border-b  border-slate-200 pb-3 last:border-0">
                    <div className="font-semibold text-slate-800 ">
                      {item.region}
                    </div>
                    <div className="text-slate-600 leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-slate-50 border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                {isCritical ? <AlertCircle className="w-4 h-4 text-red-600" /> : <CheckCircle2 className="w-4 h-4 text-slate-500" />}
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Impression</h3>
              </div>

              <ul className="space-y-2">
                {imagingReportContents.impressions.map((value, index) => (
                  <li key={index} className="text-sm  text-slate-800 flex gap-2 items-start">
                    <span className="text-slate-600 select-none">•</span>
                    <span className="leading-relaxed">{value}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-mono">
                Electronically Signed by: RADIOLOGY DEPARTMENT at {displayDate} {displayTime}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default ImagingReport