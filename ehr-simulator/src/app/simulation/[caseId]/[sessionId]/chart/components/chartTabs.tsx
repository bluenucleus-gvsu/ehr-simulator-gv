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
      <Tabs value={currentTabValue} className="w-fit pl-10 mt-auto self-end ">
        <TabsList className="w-full h-8 p-0 bg-transparent justify-start self-end rounded-none">
          {[
            ...tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                onClick={() => handleTabClick(tab.path)}
                value={tab.value}
                className="rounded-none bg-gray-200 p-3 data-[state=active]:h-10 data-[state=active]:px-4  data-[state=active]:shadow-black/20 ring-none outline-none border border-gray-300 data-[state=active]:bg-gray-100 -mb-[2px] rounded-t-md flex items-center"
              >
                {tab.icon}
                <p className="text-md font-normal tracking-tight">{tab.name}</p>
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
