import { Label } from "@/components/ui/label"
import MedAdminCardTable, { heparinTable } from "./medAdminCardTable"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { useState } from "react";

export const HeparinInfusionCalculator = () => {
  const [dosingWeight, setDosingWeight] = useState("");
  const [infusionRate, setInfusionRate] = useState("12"); // Standard protocol default

  const weightNum = parseFloat(dosingWeight) || 0;
  const rateNum = parseFloat(infusionRate) || 0;

  const calculatedUnitsHr = weightNum * rateNum;
  const maxUnitsHr = 1000; // Standard safety cap
  const actualUnitsHr = Math.min(calculatedUnitsHr, maxUnitsHr);

  // Standard Infusion Concentration (25,000 units in 250mL = 100 units/mL)
  const concentrationUnitsPerMl = 100;
  const pumpRateMlHr = actualUnitsHr > 0 ? (actualUnitsHr / concentrationUnitsPerMl).toFixed(1) : 0;

  return (
    <>
      <MedAdminCardTable table={heparinTable} />
      <div className="flex flex-col gap-2 py-2 px-3 border rounded-xl bg-slate-50/50 shadow-xs w-fit">
        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Initial Rate Calculator</h1>

        <div className="flex items-end gap-2">
          {/* Units/kg/hr Input */}
          <div className="w-20">
            <Label className="text-[10px] uppercase text-slate-800">Rate</Label>
            <InputGroup className="h-8 mt-0.5 bg-white">
              <InputGroupInput
                className="text-xs px-2"
                value={infusionRate}
                onChange={(e) => setInfusionRate(e.target.value)}
              />
              <InputGroupAddon align="inline-end" className="text-[10px]">u/kg/hr</InputGroupAddon>

            </InputGroup>
          </div>

          <span className="pb-1.5 text-slate-400 font-medium">×</span>

          {/* Weight Input */}
          <div className="w-20">
            <Label className="text-[10px] uppercase text-slate-800">Dosing Wt</Label>
            <InputGroup className="h-8 mt-0.5 bg-white">
              <InputGroupInput
                className="text-xs px-2"
                placeholder="0"
                value={dosingWeight}
                onChange={(e) => setDosingWeight(e.target.value)}
              />
              <InputGroupAddon align="inline-end" className="text-[10px]">kg</InputGroupAddon>
            </InputGroup>
          </div>

          <span className="pb-1.5 text-slate-400 font-medium">=</span>

          {/* Resulting Dose */}
          <div className="min-w-[110px]">
            <Label className={`text-[10px] uppercase ${calculatedUnitsHr > maxUnitsHr ? "text-amber-700 font-bold" : "text-slate-800"}`}>
              Dose {calculatedUnitsHr > maxUnitsHr && "(Capped)"}
            </Label>
            <div className={`h-8 mt-0.5 border shadow-inner rounded-md text-xs flex items-center px-2 font-bold transition-colors ${calculatedUnitsHr > maxUnitsHr
              ? "bg-amber-100 border-amber-300 text-amber-800"
              : "bg-white border-slate-200 text-slate-900"
              }`}>
              {actualUnitsHr.toLocaleString()} units/hr
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 my-1"></div>

        {/* Pump Rate Output */}
        <div className="flex justify-between items-center bg-blue-100/50 rounded-lg px-2 py-1.5 border border-blue-200/50">
          <div className="flex flex-col">
            <span className="text-sm text-blue-900 font-bold uppercase leading-none">IV Pump Rate:</span>
          </div>
          <div className="text-sm font-black text-blue-900">
            {pumpRateMlHr} mL/hr
          </div>
        </div>
      </div>
    </>
  );
};

export const HeparinBolusCalculator = () => {
  const [dosingWeight, setDosingWeight] = useState("");
  const [bolusRate, setBolusRate] = useState("");

  const weightNum = parseFloat(dosingWeight) || 0;
  const rateNum = parseFloat(bolusRate) || 0;

  const calculatedBolusUnits = weightNum * rateNum;

  return (
    <div className="flex flex-col gap-2 py-2 px-3 border rounded-xl bg-slate-50/50 shadow-xs w-fit">
      <h1 className="text-sm font-bold uppercase tracking-wider">Bolus Calculator</h1>
      <div className="flex items-end gap-2">
        <div className="w-20">
          <Label className="text-[10px] uppercase">Bolus</Label>
          <InputGroup className="h-8 mt-0.5 bg-white">
            <InputGroupInput
              className="text-xs px-2"
              value={bolusRate}
              onChange={(e) => setBolusRate(e.target.value)}
            />
            <InputGroupAddon align="inline-end" className="text-[10px]">u/kg</InputGroupAddon>

          </InputGroup>
        </div>

        <span className="pb-1.5 text-slate-400 font-medium">×</span>

        {/* Weight Input */}
        <div className="w-20">
          <Label className="text-[10px] uppercase ">Dosing Wt</Label>
          <InputGroup className="h-8 mt-0.5 bg-white">
            <InputGroupInput
              className="text-xs px-2"
              placeholder="0"
              value={dosingWeight}
              onChange={(e) => setDosingWeight(e.target.value)}
            />
            <InputGroupAddon align="inline-end" className="text-[10px]">kg</InputGroupAddon>
          </InputGroup>
        </div>

        <span className="pb-1.5 text-slate-400 font-medium">=</span>

        {/* Resulting Dose */}
        <div className="min-w-[100px]">
          <Label className={`text-[10px] uppercase`}>
            Bolus Dose
          </Label>
          <div className={`h-8 mt-0.5 border shadow-inner rounded-md text-xs flex items-center px-2 font-bold transition-colors`}>
            {calculatedBolusUnits.toLocaleString()} units
          </div>
        </div>
      </div>
    </div>
  );
};
