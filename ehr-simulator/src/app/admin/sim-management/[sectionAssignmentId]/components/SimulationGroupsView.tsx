"use client";

import { useState, useMemo } from "react";
import FeedbackModal from "@/app/admin/sim-management/components/feedbackModal";
import { FeedbackTarget, ActiveSimView } from "@/lib/sim-management";
import ReleasePanelDialog from "./ReleasePanelDialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

function formatSimTime(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SimulationGroupsView({
  activeSimView,
}: {
  activeSimView: ActiveSimView;
}) {
  const { simulation, courseName, sectionName } = activeSimView;
  const [feedbackTarget, setFeedbackTarget] = useState<FeedbackTarget | null>(null);
  const [submittedFeedback, setSubmittedFeedback] = useState<Record<string, string>>({});
  const phases = simulation.phaseCount;

  const sortedGroups = useMemo(() => {
    return [...simulation.groups].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );
  }, [simulation.groups]);

  const [releasePanelGroup, setReleasePanelGroup] = useState<{
    id: string;
    name: string;
    caseSessionId: string;
  } | null>(null);

  const handleSubmit = (key: string, feedback: string) => {
    setSubmittedFeedback((prev) => ({ ...prev, [key]: feedback }));
  };

  const openReleasePanel = (id: string, name: string) => {
    const group = simulation.groups.find((g) => g.id === id);
    if (!group?.caseSessionId) {
      toast.error("No valid case session was found for this group.");
      return;
    }
    setReleasePanelGroup({ id, name, caseSessionId: group.caseSessionId });
  };

  return (
    <div className="space-y-4">
      <header className="bg-white border-b px-8 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {courseName} · {sectionName}
            </p>
            <h2 className="text-xl font-semibold">
              {simulation.caseName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatSimTime(simulation.simTime)}
            </p>
          </div>
          <Link href={routes.admin["sim-management"].getHref()}>
            <Button
              className="border-blue-500 text-blue-700 hover:text-blue-700"
              variant="outline"
            >
              <MoveLeft />
              Back to Section Selection
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-6 px-6 md:grid-cols-2">
        {sortedGroups.map((group) => {
          const groupFeedbackKey = `group:${group.id}`;
          const hasGroupFeedback = !!submittedFeedback[groupFeedbackKey];

          return (
            <Card key={group.id} data-testid={`group-card-${group.id}`} className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">{group.name}</h4>
                <button
                  onClick={() =>
                    setFeedbackTarget({
                      kind: "group",
                      groupId: group.id,
                      groupName: group.name,
                    })
                  }
                  className={`px-3 py-1 text-xs rounded-md font-medium ${hasGroupFeedback
                    ? "bg-green-50 text-green-700 border border-green-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  disabled={true}
                >
                  {hasGroupFeedback ? "✓ Group Feedback Given" : "Give Group Feedback"}
                </button>
              </div>

              <ul className="divide-y divide-gray-200">
                {group.members.map((member) => {
                  // const memberFeedbackKey = `member:${member.id}`;
                  // const hasMemberFeedback = !!submittedFeedback[memberFeedbackKey];
                  return (
                    <li key={member.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700">{member.name}</span>
                      </div>
                      {/* <button
                        onClick={() =>
                          setFeedbackTarget({
                            kind: "individual",
                            studentId: member.id,
                            studentName: member.name,
                            groupName: group.name,
                          })
                        }
                        className={`px-2 py-1 text-xs rounded-md font-medium ${hasMemberFeedback
                          ? "bg-green-50 text-green-700 border border-green-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        disabled={true}
                      >
                        {hasMemberFeedback ? "✓ Feedback Given" : "Give Feedback"}
                      </button> */}
                    </li>
                  );
                })}
              </ul>

              <Button
                onClick={() => openReleasePanel(group.id, group.name)}
                className="mt-auto"
              >View Releasable Items</Button>

            </Card>
          );
        })}
      </div>

      {feedbackTarget && (
        <FeedbackModal
          title={
            feedbackTarget.kind === "group"
              ? `Group Feedback – ${feedbackTarget.groupName}`
              : `Individual Feedback – ${feedbackTarget.studentName}`
          }
          onClose={() => setFeedbackTarget(null)}
          onSubmit={(text) => {
            const key =
              feedbackTarget.kind === "group"
                ? `group:${feedbackTarget.groupId}`
                : `member:${feedbackTarget.studentId}`;
            handleSubmit(key, text);
          }}
        />
      )}

      <ReleasePanelDialog
        open={releasePanelGroup !== null}
        onOpenChange={(open) => {
          if (!open) setReleasePanelGroup(null);
        }}
        groupName={releasePanelGroup?.name ?? ""}
        sessionId={releasePanelGroup?.caseSessionId ?? ""}
        phaseCount={phases}
      />

    </div>
  );
}
