"use client";

import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"

type DbOrder = {
  category?: string | null;
  title?: string | null;
  details?: string | null;
};

/** Case Builder often saves category name as title; real diet text is usually in `details`. */
function formatDietOrderDisplay(order: DbOrder): string {
  const title = (order.title ?? "").trim();
  const details = (order.details ?? "").trim();
  const titleIsPlaceholder = !title || /^(diet|nutrition)s?$/i.test(title);

  if (!titleIsPlaceholder && details && title.toLowerCase() !== details.toLowerCase()) {
    return `${title} — ${details}`;
  }
  if (!titleIsPlaceholder) {
    return title;
  }
  if (details) {
    return details;
  }
  return "N/A";
}

const Nutrition = () => {
  const { caseBundle } = useSimulationCase();
  const dbOrders = (caseBundle?.orders ?? []) as DbOrder[];
  const dietOrders = dbOrders.filter((order) => {
    const normalized = (order.category ?? "").toLowerCase();
    return normalized === "diet" || normalized === "nutrition";
  });
  if (dietOrders.length == 0) return null;
  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-sky-200" firstLetter="N" secondLetter="utrition" />
      <CardContent className="grid gap-2 px-4">

        {dietOrders.map((order, index) => (
          <div key={`${order.category}-${index}`} className="flex pl-2 gap-3">
            <p className="text-md  font-light tracking-tight">Diet:</p>
            <p className="text-md tracking-tight">{formatDietOrderDisplay(order)}</p>
          </div>
        ))}
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3"></div>
    </Card>
  )
}

export default Nutrition