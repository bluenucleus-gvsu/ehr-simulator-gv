"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimSessionContext } from "@/context/SimSessionContext";
import { Clipboard, NotebookText, Pill, TestTubeDiagonal } from "lucide-react";
// import MultiPtSelector from "./multiPtSelector";
import { useParams, usePathname } from "next/navigation"
import { useRouter } from "next/navigation";
import { useState } from "react";
import NavigationAlert from "./navigationAlert";


export default function ChartTabs() {
  const { hasUnsavedCharting } = useSimSessionContext()
  const params = useParams()
  const router = useRouter();
  const { sessionId, caseId } = params
  const [showWarning, setShowWarning] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const pathname = usePathname();

  const handleConfirmNavigation = (pendingPath: string) => {
    if (pendingPath) {
      setShowWarning(false);
      router.push(pendingPath);
      setPendingPath(null);
    }
  }
  const handleTabClick = (path: string) => {
    const isOnFlexSheetPage = pathname?.includes('/chart/charting');

    // Block navigation only if on FlexSheet tab and has unsaved changes
    if (hasUnsavedCharting && isOnFlexSheetPage) {
      setPendingPath(path);
      setShowWarning(true);
    } else {
      router.push(path);
    }
  };


  const tabs = [
    {
      name: "Overview",
      value: "overview",
      path: `/simulation/${caseId}/${sessionId}/chart/overview`,
      icon: null
    },
    {
      name: "Labs",
      value: "labs",
      icon: <TestTubeDiagonal className="size-4" />,
      path: `/simulation/${caseId}/${sessionId}/chart/labs`,
    },
    // {
    //   name: "Avatar",
    //   value: "Avatar",
    //   icon: <User />,
    //   path: `/simulation/${caseId}/${sessionId}/chart/overview`,
    // },
    {
      name: "Orders",
      value: "orders",
      icon: <Clipboard className="size-4" />,
      path: `/simulation/${caseId}/${sessionId}/chart/orders`,
    },
    {
      name: "MAR",
      value: "mar",
      icon: <Pill className="size-4" />,
      path: `/simulation/${caseId}/${sessionId}/chart/mar`,
    },
    {
      name: "Notes",
      value: "notes",
      icon: <NotebookText className="size-4" />,
      path: `/simulation/${caseId}/${sessionId}/chart/notes`,

    },
    {
      name: "FlexSheets",
      value: "charting",
      icon: null,
      path: `/simulation/${caseId}/${sessionId}/chart/charting`,
    },
  ];
  const currentTabValue = pathname?.split("/").pop() ?? tabs[0].value;

  return (
    <>
      <Tabs value={currentTabValue} className="w-fit pl-6 mt-auto">
        <TabsList className="w-full h-12 p-1.5 bg-slate-900/15 backdrop-blur-md justify-start rounded-2xl border border-white/35 shadow-md">
          {[
            ...tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                onClick={() => handleTabClick(tab.path)}
                value={tab.value}
                className="group h-9 rounded-xl px-3.5 text-sm font-medium text-white/95 hover:text-white hover:bg-white/20 hover:shadow-sm hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow data-[state=active]:font-semibold transition-all duration-200 border border-white/20 data-[state=active]:border-slate-200 flex items-center gap-1.5"
              >
                <span className="transition-transform duration-200 group-hover:scale-110">
                  {tab.icon}
                </span>
                <p className="text-sm tracking-tight">{tab.name}</p>
              </TabsTrigger>
            )),
            // For future mutli-pt sims
            // <MultiPtSelector key="multiPatientSelector" />
          ]}
        </TabsList>
      </Tabs>
      <NavigationAlert
        showWarning={showWarning}
        setShowWarning={setShowWarning}
        pendingPath={pendingPath}
        setPendingPath={setPendingPath}
        handleConfirmNavigation={handleConfirmNavigation}

      />
    </>
  );
}
