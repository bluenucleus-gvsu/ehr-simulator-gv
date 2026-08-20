"use client"

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Droplets, GlassWater } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useFormContext } from "@/context/FormContext";
import { IntakeOutputFormData } from "@/utils/form";
import { FormShell } from "../../components/formShell";
import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { CaseSection } from "@/lib/saveCase";
import { caseBuilderPath } from "@/lib/caseBuilder/routes";

const chartConfig = {
  intake: { label: "Intake", color: "hsl(var(--chart-6))" },
  output: { label: "Output", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const generateNiceTicks = (max: number, count: number = 6) => {
  if (max === 0) return [0];

  const roughStep = max / (count - 1);
  const power = Math.pow(10, Math.floor(Math.log10(roughStep)));
  let step = 0;

  if (roughStep / power > 5) {
    step = 10 * power;
  } else if (roughStep / power > 2) {
    step = 5 * power;
  } else if (roughStep / power > 1) {
    step = 2 * power;
  } else {
    step = power;
  }

  const ticks = [];
  for (let i = 0; i <= max; i += step) {
    const roundedI = Math.round(i);

    if (roundedI <= max) {
      ticks.push(roundedI);
    }
    if (roundedI === max) break;
  }

  if (ticks[ticks.length - 1] !== max) {
    ticks.push(max);
  }

  return ticks;
};

function getBlocks() {
  const blocks = [];
  for (let i = 1; i < 5; i++) {

    blocks.push({
      id: i,
      label: `Block ${i}`
    });
  }
  return blocks;
}

export default function IntakeOutputForm() {
  const { onDataChange, ioData, caseId } = useFormContext();

  const blocks = useMemo(() => getBlocks(), []);

  const [intakeOutput, setIntakeOutput] = useState<IntakeOutputFormData[]>(ioData);

  const roundedMax = useMemo(() => {
    const max = Math.max(
      ...intakeOutput.map(item => item.intake),
      ...intakeOutput.map(item => item.output),
      2000
    );
    return Math.ceil(max / 500) * 500;
  }, [intakeOutput]);

  const niceTicks = useMemo(() => generateNiceTicks(roundedMax, 6), [roundedMax]);

  const yAxisWidth = useMemo(() => {
    const digits = roundedMax.toString().length;
    return Math.max(48, digits * 12);
  }, [roundedMax]);

  const handleValueChange = (blockId: number, type: 'intake' | 'output', value: string) => {
    if (value === '') {
      setIntakeOutput(prev =>
        prev.map(item => item.blockId === blockId ? { ...item, [type]: 0 } : item)
      );
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 99999999) {
      setIntakeOutput(prev =>
        prev.map(item => item.blockId === blockId ? { ...item, [type]: numValue } : item)
      );
    }
  };

  const tickLabelStyles = { fontSize: 14, fontFamily: 'var(--font-sans)' }

  const router = useRouter();

  const persistIo = async () => {
    onDataChange("intakeOutput", intakeOutput);
    if (caseId) {
      await saveCaseData({
        payload: intakeOutput,
        section: CaseSection.INTAKE_OUTPUT,
        caseId,
      });
    }
  };

  const goBack = async () => {
    await persistIo();
    router.push(caseBuilderPath("/admin/case-builder/form/charting", caseId));
  };

  const handleSubmit = async () => {
    await persistIo();
    router.push(caseBuilderPath("/admin/case-builder/form/medications", caseId));
  };

  return (
    <FormShell
      title="Intake & Output"
      stepDescription="Step 7 of 10: Record patient intake and output"
      icon={<Droplets className="text-slate-400" />}
      onSubmit={handleSubmit}
      goBack={goBack}
      continueButtonText="Continue"
      backButtonText="Back"
      continueButtonTooltip="Proceed to Next Page"
      backButtonTooltip="Return to Previous Page"
    >
      <div className="flex-1 bg-slate-50/50 overflow-y-auto p-6 md:px-8 lg:px-12 w-full">
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
          <div className="flex flex-col lg:max-w-3xl 2xl:max-w-4xl w-full mx-auto">
            <Card className="border-slate-200 shadow-sm w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GlassWater className="w-5 h-5 text-blue-600" />
                  Intake / Output 12-Hour Block Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4">
                <div className="w-full overflow-x-auto pb-2">
                  <div className="flex gap-2 h-[350px] min-w-[600px] md:min-w-0 md:w-full">
                    {blocks.map((block, index) => {
                      const data = intakeOutput.find(item => item.blockId === block.id) || { intake: 0, output: 0 };

                      const chartData = [{
                        label: block.label,
                        intake: data.intake,
                        output: data.output,
                      }];

                      return (
                        <Popover key={block.id}>
                          <PopoverTrigger asChild>
                            <div
                              className={`flex-1 flex-col flex min-w-0 h-full hover:bg-slate-50 rounded-md transition-colors p-1 [&_.recharts-surface]:cursor-pointer text-slate-500`}>
                              <ChartContainer config={chartConfig} className="h-full w-full flex flex-col items-center">
                                <BarChart
                                  data={chartData}
                                  margin={{ top: 20, right: 0, left: block.id === 1 ? 0 : -yAxisWidth, bottom: 20 }}

                                >
                                  <CartesianGrid vertical={false} horizontal={true} />
                                  <XAxis
                                    dataKey="label"
                                    tick={tickLabelStyles}
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                  />
                                  <YAxis
                                    tick={tickLabelStyles}
                                    ticks={niceTicks}
                                    tickFormatter={index === 0 ? (value) => `${value}` : () => ''}
                                    tickLine={false}
                                    axisLine={false}
                                    width={yAxisWidth}
                                    domain={[0, roundedMax]}
                                  />
                                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                  <Bar
                                    dataKey="intake"
                                    fill="var(--chart-6)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                  />
                                  <Bar
                                    dataKey="output"
                                    fill="var(--chart-4)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                  />
                                </BarChart>
                              </ChartContainer>

                              {/* First and last block label */}
                              <span className={"h-4 text-xs text-slate-500 w-full text-center"} style={block.id === 1 ? { paddingLeft: yAxisWidth } : undefined}>
                                {block.id === 1 && "Earliest"}
                                {block.id === 4 && "Most Recent"}
                              </span>
                            </div>

                          </PopoverTrigger>
                          <PopoverContent className="w-80" side="top" align="center">
                            <div className="space-y-4">

                              <div className="space-y-2">
                                <Label htmlFor={`intake-${block.id}`}>Intake (mL)</Label>
                                <div className="relative">
                                  <Input
                                    id={`intake-${block.id}`}
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={data.intake === 0 ? '' : data.intake}
                                    onChange={(e) => handleValueChange(block.id, 'intake', e.target.value)}
                                    className="pr-8"
                                    placeholder="0"
                                  />
                                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">mL</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`output-${block.id}`}>Output (mL)</Label>
                                <div className="relative">
                                  <Input
                                    id={`output-${block.id}`}
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={data.output === 0 ? '' : data.output}
                                    onChange={(e) => handleValueChange(block.id, 'output', e.target.value)}
                                    className="pr-8"
                                    placeholder="0"
                                  />
                                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">mL</span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-chart-6"></div>
                    <span className="text-sm text-slate-600">Intake</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-chart-4"></div>
                    <span className="text-sm text-slate-600">Output</span>
                  </div>
                </div>

              </CardContent>
            </Card>
            <p className="text-sm text-slate-500 mt-2 text-center">Click on a bar to enter or edit fluid amounts.</p>
          </div>
        </div>
      </div>
    </FormShell>
  );
}
