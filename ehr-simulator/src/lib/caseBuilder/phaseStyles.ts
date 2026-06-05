/** Distinct colors per phase (1-based index). Reused in header selector and page badges. */
export type PhaseStyle = {
  badge: string;
  selectTrigger: string;
  selectItem: string;
  dot: string;
};

export const PHASE_STYLES: PhaseStyle[] = [
  {
    badge: "bg-blue-600 text-white border-blue-700 shadow-blue-200/50",
    selectTrigger: "border-blue-300 bg-blue-50 text-blue-900",
    selectItem: "text-blue-900 focus:bg-blue-100",
    dot: "bg-blue-600",
  },
  {
    badge: "bg-emerald-600 text-white border-emerald-700 shadow-emerald-200/50",
    selectTrigger: "border-emerald-300 bg-emerald-50 text-emerald-900",
    selectItem: "text-emerald-900 focus:bg-emerald-100",
    dot: "bg-emerald-600",
  },
  {
    badge: "bg-violet-600 text-white border-violet-700 shadow-violet-200/50",
    selectTrigger: "border-violet-300 bg-violet-50 text-violet-900",
    selectItem: "text-violet-900 focus:bg-violet-100",
    dot: "bg-violet-600",
  },
  {
    badge: "bg-amber-600 text-white border-amber-700 shadow-amber-200/50",
    selectTrigger: "border-amber-300 bg-amber-50 text-amber-900",
    selectItem: "text-amber-900 focus:bg-amber-100",
    dot: "bg-amber-600",
  },
  {
    badge: "bg-rose-600 text-white border-rose-700 shadow-rose-200/50",
    selectTrigger: "border-rose-300 bg-rose-50 text-rose-900",
    selectItem: "text-rose-900 focus:bg-rose-100",
    dot: "bg-rose-600",
  },
  {
    badge: "bg-cyan-600 text-white border-cyan-700 shadow-cyan-200/50",
    selectTrigger: "border-cyan-300 bg-cyan-50 text-cyan-900",
    selectItem: "text-cyan-900 focus:bg-cyan-100",
    dot: "bg-cyan-600",
  },
  {
    badge: "bg-orange-600 text-white border-orange-700 shadow-orange-200/50",
    selectTrigger: "border-orange-300 bg-orange-50 text-orange-900",
    selectItem: "text-orange-900 focus:bg-orange-100",
    dot: "bg-orange-600",
  },
  {
    badge: "bg-fuchsia-600 text-white border-fuchsia-700 shadow-fuchsia-200/50",
    selectTrigger: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900",
    selectItem: "text-fuchsia-900 focus:bg-fuchsia-100",
    dot: "bg-fuchsia-600",
  },
  {
    badge: "bg-teal-600 text-white border-teal-700 shadow-teal-200/50",
    selectTrigger: "border-teal-300 bg-teal-50 text-teal-900",
    selectItem: "text-teal-900 focus:bg-teal-100",
    dot: "bg-teal-600",
  },
  {
    badge: "bg-indigo-600 text-white border-indigo-700 shadow-indigo-200/50",
    selectTrigger: "border-indigo-300 bg-indigo-50 text-indigo-900",
    selectItem: "text-indigo-900 focus:bg-indigo-100",
    dot: "bg-indigo-600",
  },
];

export function getPhaseStyle(phase: number): PhaseStyle {
  const idx = Math.max(0, phase - 1) % PHASE_STYLES.length;
  return PHASE_STYLES[idx]!;
}
