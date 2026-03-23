import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clipboard, NotebookText, Pill, TestTubeDiagonal, User } from "lucide-react";
// import MultiPtSelector from "./multiPtSelector";
import Link from "next/link";
import { useParams } from "next/navigation"


export default function ChartTabs() {
  const params = useParams()
  const { sessionId, caseId } = params
  const tabs = [
    {
      name: "Overview",
      value: "Overview",
      path: `/simulation/${caseId}/${caseId}/${sessionId}/chart/overview`,
      icon: ''
    },
    {
      name: "Labs",
      value: "Labs",
      icon: <TestTubeDiagonal />,
      path: `/simulation/${caseId}/${sessionId}/chart/labs`,
    },
    {
      name: "Avatar",
      value: "Avatar",
      icon: <User />,
      path: `/simulation/${caseId}/${sessionId}/chart/overview`,
    },
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
    <Tabs defaultValue={tabs[0].value} className="w-fit pl-10 mt-auto ">
      <TabsList className="w-full h-8 p-0 bg-transparent justify-start rounded-none">
        {[
          ...tabs.map((tab) => (
            <Link
              key={tab.value}
              href={tab.path}
              className="rounded-none h-full flex items-center "
            >
              <TabsTrigger
                value={tab.value}
                className="rounded-none bg-gray-200 p-3 data-[state=active]:h-10 data-[state=active]:px-4  data-[state=active]:shadow-black/20 ring-none outline-none border border-gray-300 data-[state=active]:bg-gray-100 -mb-[2px] rounded-t-md flex items-center"
              >
                {tab.icon}
                <p className="text-md font-normal tracking-tight">{tab.name}</p>
              </TabsTrigger>
            </Link>
          )),
          // <MultiPtSelector key="multiPatientSelector" />
        ]}
      </TabsList>
    </Tabs>
  );
}
