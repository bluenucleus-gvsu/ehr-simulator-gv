'use client'

import { ImagingData, LabCellValue } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";
import { FileText, X } from "lucide-react";
import { useState } from "react"
import { toast } from "sonner";


interface AddImagingProps {
  imagingType: string
  handleAddImagingReport: (report: LabCellValue) => void;
  initialData?: ImagingData;
}

interface Finding {
  region: string;
  description: string;
}

const AddImagingReport = ({ imagingType, handleAddImagingReport, initialData }: AddImagingProps) => {
  const isEditMode = !!initialData;
  const [technique, setTechnique] = useState(initialData?.technique || '')
  const [findings, setFindings] = useState<Finding[]>(initialData?.findings || [])
  const [impressions, setImpressions] = useState<string[]>(initialData?.impressions || [])
  const [isCritical, setIsCritical] = useState<'indeterminate' | boolean>(initialData?.isCritical || false)

  const [region, setRegion] = useState('')
  const [description, setDescription] = useState('')
  const [impression, setImpression] = useState<string>('')

  const newEntry = {
    displayName: imagingType,
    technique: technique,
    findings: findings,
    impressions: impressions,
    isCritical: isCritical
  }

  const isSubmittable =
    !!imagingType &&
    !!technique &&
    findings.length > 0 &&
    impressions.length > 0;

  const handleAddFinding = () => {
    if (!description || !region) {
      toast.warning("Enter a body region and description")
      return
    }
    const finding: Finding = { region: region, description: description }

    setFindings(prev => [...prev, finding])
    setRegion('')
    setDescription('')
  }

  const handleAddImpression = () => {
    if (!impression) {
      alert('Impression cannot be empty')
    }
    setImpressions(prev => [...prev, impression])
    setImpression('')
  }

  const handleRemoveFinding = (index: number) => {
    setFindings(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveImpression = (index: number) => {
    setImpressions(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    handleAddImagingReport(newEntry)
  }


  return (
    <DialogContent className="flex flex-col sm:max-w-150 lg:max-w-none w-250 h-full max-h-9/10 overflow-hidden p-0 m-0">
      <div className="flex gap-4 p-4 bg-slate-100 items-center border-b border-slate-200 h-20">
        <FileText size={28} />
        <h1 className="text-3xl tracking-tight font-semibold">
          {isEditMode ? "Edit Imaging Report" : "Imaging Report"}
        </h1>
      </div>
      <Button disabled={!isSubmittable} onClick={handleSubmit} type='button' className="absolute top-6 right-16 bg-blue-600 hover:bg-blue-700">
        {isEditMode ? 'Update Imaging Report' : 'Add New Imaging Report'}
      </Button>
      <div className="flex-1 flex flex-col w-full overflow-y-auto gap-6 px-10 py-6 ">
        <div>
          <Label className="mb-1 text-lg" htmlFor="technique">Technique</Label>
          <Textarea id='technique' value={technique} onChange={(e) => setTechnique(e.target.value)} />
        </div>

        <div className="py-2 rounded w-full space-y-4">
          <h1 className="text-lg font-medium border-b">Findings</h1>
          <div>
            <Label>Body Region</Label>
            <Input onChange={(e) => setRegion(e.target.value)} value={region} className="w-60 mt-1" />
          </div>
          <div>
            <Label>Description</Label>
            <Input onChange={(e) => setDescription(e.target.value)} value={description} className="mt-1" />
          </div>
          <Button
            onClick={handleAddFinding}
            className="bg-blue-600 hover:bg-blue-700 shadow"
            disabled={!region || !description}
          >
            Add Finding
          </Button>

          <div className="flex flex-col gap-4 justify-start pb-2">
            {findings.map((finding, index) =>
              <div
                key={index}
                className="group relative bg-white border border-slate-200 rounded-md shadow-sm hover:shadow-md flex flex-col md:grid md:grid-cols-20 overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200`} />

                <div className="md:col-span-3 p-2 pl-6 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200">
                  <h4 className="font-medium text-xs text-slate-900 leading-tight">{finding.region}</h4>
                </div>
                <div className="md:col-span-16 p-2 flex items-center md:border-r bg-slate-50/30 border-slate-200">
                  <h4 className="font-medium text-xs text-slate-900 leading-tight">{finding.description}</h4>
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  <button
                    onClick={() => handleRemoveFinding(index)}
                    className=" p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>

              </div>
            )}
          </div>
        </div >

        <div className="w-full space-y-4">
          <h1 className="text-lg font-medium border-b">Impressions</h1>
          <Label className="mb-1" htmlFor="impressions">Description</Label>
          <Textarea value={impression} onChange={(e) => setImpression(e.target.value)} id="impressons" />
          <Button onClick={handleAddImpression}
            className="bg-blue-600 hover:bg-blue-700 shadow"
          >
            Add Impression
          </Button>
          <div className="flex flex-col justify-start gap-4">
            {impressions.map((item, index) =>
              <div
                key={index}
                className="relative bg-slate-50/30 border border-slate-200 rounded-lg shadow-sm hover:shadow-md flex justify-between p-2 overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200`} />
                <p className="font-medium text-xs text-slate-900 leading-tight px-4">{item}</p>
                <button
                  onClick={() => handleRemoveImpression(index)}
                  className=" p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 ml-2">
          <p>Mark as critical or abnormal finding?</p>
          <Checkbox checked={isCritical} onCheckedChange={setIsCritical} className="border-gray-300" />
        </div>
      </div>

    </DialogContent>
  )
}

export default AddImagingReport

