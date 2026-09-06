interface PhasesProps {
    phaseRows: number[][];
    currentPhase: number;
    handlePhaseAdvancement: (
        id: string,
        name: string,
        selectedPhase: number
    ) => void;
    group: any;
}
  
export default function Phases ({
    phaseRows,
    currentPhase,
    handlePhaseAdvancement,
    group
}: PhasesProps
) {
    return(
        <div className="flex-1 min-w-[18rem] space-y-1">
            {phaseRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap items-center">
                {row.map((phaseIndex, idx) => {
                    const isClickable = phaseIndex !== currentPhase;
                    const phaseClass =
                        phaseIndex < currentPhase
                            ? "bg-green-500 hover:bg-green-600"
                            : phaseIndex === currentPhase
                            ? "bg-blue-500"
                            : "bg-slate-300 hover:bg-slate-400";

                    return (
                        <button
                            key={phaseIndex}
                            onClick={() =>
                                isClickable &&
                                handlePhaseAdvancement(group.id, group.name, phaseIndex)
                            }
                            disabled={!isClickable}
                            style={{
                                clipPath:
                                idx === 0
                                    ? "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)"
                                    : "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)",
                                marginLeft: idx === 0 ? "0" : "-10px",
                                zIndex: phaseIndex,
                            }}
                            className={`relative px-4 py-1.5 text-sm font-medium text-white ${phaseClass} ${
                                !isClickable ? "cursor-default" : "cursor-pointer"
                            }`}
                        >
                        P{phaseIndex}
                        </button>
                    );
                })}
            </div>
            ))}
        </div>
    )
}