import Visitors from "./components/visitors"
import RecurringOrders from "./components/recurringOrders"
import Nutrition from "./components/nutrition"
import ActiveProblems from "./components/activeProblems"
import Alerts from "./components/alerts"
// import CareTeam from "./components/careTeam"
import { SelectedLabs } from "./components/selectedLabs"
// import MarSnapshot from "./components/marSnapshot"
import Demographics from "./components/demographics"
import FamilyHistory from "./components/familyHistory"
import SurgicalHistory from "./components/surgicalHistory"
import SocialHabits from "./components/socialHabits"
import LivingSituation from "./components/livingSituation"
import { IntakeOutput } from "./components/intakeOutput"
import VitalsOverviewContainer from "./components/vitalsOverviewContainer"

interface OverviewPageProps {
  params: Promise<{
    caseId: string;
    sessionId: string;
  }>;
}

const OverviewPage = ({ params }: OverviewPageProps) => {
  const cards = [
    <Alerts key="alerts" />,
    <ActiveProblems key="active-problems" />,
    <VitalsOverviewContainer key="vitals-overview" params={params} />,
    <RecurringOrders key="recurring-orders" />,
    <Visitors key="visitors" />,
    <Nutrition key="nutrition" />,
    // Care team is hard-coded
    // <CareTeam key="care-team" />,
    <IntakeOutput key="intake-output" />,
    <SelectedLabs key="selected-labs" />,
    // <MarSnapshot key="mar-snapshot" />,
    <Demographics key="demographics" />,
    <FamilyHistory key="family-history" />,
    <SurgicalHistory key="surgical-history" />,
    <SocialHabits key="social-habits" />,
    <LivingSituation key="living-situation" />,
  ];

  return (
    <div className="box-border flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden bg-gray-100 px-2 pt-4">
      <div className="min-h-0 flex-1 min-w-0 max-w-full overflow-x-auto overflow-y-auto rounded-t-2xl border px-2 inset-shadow-sm">
        <div className="columns-1 gap-3 py-2 [column-fill:_balance] sm:columns-2 xl:columns-3 2xl:columns-4">
          {cards.map((card) => (
            <div key={card.key?.toString()} className="mb-3 max-w-full min-w-0 break-inside-avoid">
              {card}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OverviewPage
