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
      value: "Overview",
      path: `/simulation/${caseId}/${sessionId}/chart/overview`,
      icon: ''
    },
    {
      name: "Labs",
      value: "Labs",
      icon: <TestTubeDiagonal />,
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
      value: "Orders",
      icon: <Clipboard />,
      path: `/simulation/${caseId}/${sessionId}/chart/orders`,
    },
    {
      name: "MAR",
      value: "MAR",
      icon: <Pill />,
      path: `/simulation/${caseId}/${sessionId}/chart/mar`,
    },
    {
      name: "Notes",
      value: "Notes",
      icon: <NotebookText />,
      path: `/simulation/${caseId}/${sessionId}/chart/notes`,

    },
    {
      name: "FlexSheets",
      value: "FlexSheets",
      icon: "",
      path: `/simulation/${caseId}/${sessionId}/chart/charting`,
    },
  ];
  return (
    <>
      <Tabs defaultValue={tabs[0].value} className="w-fit pl-10 mt-auto ">
        <TabsList className="w-full h-8 p-0 bg-transparent justify-start rounded-none">
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
