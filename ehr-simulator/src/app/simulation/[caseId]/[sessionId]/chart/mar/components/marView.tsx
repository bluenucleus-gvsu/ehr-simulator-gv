'use client'

import { addMinutes, differenceInMinutes } from 'date-fns'
import MedCard from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/medCard";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AllMedicationTypes, MedicationOrder } from "./marData";
import MedAdministrationPanel from "./medAdministrationPanel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { ClipboardClock, Filter, PillBottle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { MultiMedPopover } from './multiMedPopover';
import { toast } from 'sonner';
import WrongPatientAlert from './wrongPatientAlert';
import { createColumns } from '@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marHelpers';
import { PatientStatusBadge } from './marHelpers';
import ColumnShiftControl from './columnShiftControl';
import { DatabaseMedAdministration, StudentMedicationAdministration, submitMedicationAdministrations } from '@/actions/simulation';
import { useSimSessionContext } from '@/context/SimSessionContext';
import { useSimulationCase } from '@/context/SimulationCaseContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentSimulationEditAccess } from '@/utils/studentSimulationEditAccess';
import { useParams } from 'next/navigation';
import { isVisibleForSimulationPhase } from '@/lib/simulationPhaseVisibility';
import { useSimulationScanner } from '@/hooks/useSimulationScanner';
import ScanWristbandAlert from './scanWristbandAlert';


export interface NewAdministrationData {
  [medOrderId: string]: StudentMedicationAdministration;
}

interface MarViewData {
  medications: AllMedicationTypes[];
  medicationOrders: MedicationOrder[];
  medicationAdministrations: DatabaseMedAdministration[];
  params: {
    caseId: string;
    sessionId: string;
  }
}

const filterOptions = ["Scheduled", "Continuous", "PRN"]
export default function MarView({
  medications,
  medicationOrders,
  medicationAdministrations,
  params
}: MarViewData) {
  const router = useRouter();
  const { routeContext } = useSimulationCase();
  const resolvedCaseId = routeContext?.caseId ?? params.caseId;
  // context
  const { userId, groupId, isPresim, userName, simStartTime, loading, currentPhase } = useSimSessionContext();
  const { canEdit } = useStudentSimulationEditAccess();
  const { caseId } = useParams()
  const patientWristband = String(caseId)
  // med data
  const [selectedOrders, setSelectedOrders] = useState<MedicationOrder[]>([]);
  const [newAdministrations, setNewAdministrations] = useState<NewAdministrationData>({});
  const [associatedOrders, setAssociatedOrders] = useState<MedicationOrder[]>([])
  // filters
  const [isDue, setIsDue] = useState<boolean | undefined>(false)
  const [orderFilter, setOrderFilter] = useState<string>('');
  // alerts
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isScanned, setIsScanned] = useState(false);
  const [isMultiOrderPopoverOpen, setIsMultiOrderPopoverOpen] = useState<boolean>(false)
  const [isWrongPtScan, setIsWrongPtScan] = useState<boolean>(false)
  const [isMedAdminPanelOpen, setIsMedAdminPanelOpen] = useState(false);
  const [missedPtScan, setMissedPtScan] = useState(false);
  // time management
  const [timeColumnOffset, setTimeColumnOffset] = useState(0)
  const [fallbackTime] = useState(() => new Date());
  const anchorDate = useMemo(() => {
    if (!simStartTime) {
      return fallbackTime;
    }

    const sessionAnchor = new Date(simStartTime);

    return sessionAnchor;
  }, [simStartTime, fallbackTime]);

  const [elapsedMinutes, setElapsedMinutes] = useState(() => {
    return differenceInMinutes(new Date(), anchorDate);
  });

  const handleScan = (symbol: string) => {
    // Patient wristband scan is 39 chars, if scans are failing due to excessive length 
    // check the scanner's prefix settings.
    if (symbol.length > 39) {
      toast.warning('Your scanner might be configured incorrectly. Please report this to your Sim instructor.')
      return
    }

    symbol = symbol.trim()

    // handle patient wristband scans
    if (symbol.slice(0, 3) === '~pt') {
      if (symbol.slice(3) === patientWristband) {
        setIsScanned(true);
        return;
      } else {
        if (!isWrongPtScan) {
          setIsWrongPtScan(true);
        }
      }
      return;
    }

    if (!isScanned) {
      setMissedPtScan(true)
      return
    }

    const associatedOrders = releasedMedicationOrders.filter(order => order.medicationId === symbol);

    if (associatedOrders.length === 0) {
      toast.info(`No orders found with medication ID: ${symbol}`)
      return
    }

    const existingSelectedOrder = selectedOrders.find(selected =>
      associatedOrders.some(associated => associated.id === selected.id)
    );

    // Resolve between multiple orders sharing the same medication
    if (!existingSelectedOrder && associatedOrders.length > 1) {
      setAssociatedOrders(associatedOrders)
      setIsMultiOrderPopoverOpen(true)
      return
    }

    if (!isMedAdminPanelOpen) {
      setIsMedAdminPanelOpen(true)
    }

    const targetOrder = existingSelectedOrder || associatedOrders[0];
    const linkedMedication = medsById[targetOrder.medicationId]

    if (existingSelectedOrder) {
      setNewAdministrations(prev => {
        const currentAdmin = prev[targetOrder.id];

        if (!currentAdmin) {
          console.warn('No administration data found.')
          return prev;
        }

        return {
          ...prev,
          [targetOrder.id]: {
            ...currentAdmin,
            administered_dose: (currentAdmin.administered_dose || 0) + (linkedMedication.strength || 0)

          }
        };
      })
    } else {
      if (!userId || !groupId) {
        toast.error("Missing user or group session data.");
        return;
      }
      setSelectedOrders(prev => [...prev, targetOrder])

      setNewAdministrations(prev => ({
        ...prev,
        [targetOrder.id]: {
          case_id: resolvedCaseId,
          case_session_id: params.sessionId,
          medication_order_id: targetOrder.id,
          user_id: userId,
          group_id: groupId,

          status: "Given",
          administrator: userName,
          time_offset: 0, // updated on submission
          administered_dose: linkedMedication.strength,
          infusion_rate: targetOrder.infusionRate,
          is_in_presim: false,
          notes: '',
        }
      }));
    }
  }

  const handleMultiOrderPopoverChoice = (order: MedicationOrder) => {
    if (!userId || !groupId) {
      toast.error("Missing user or group session data.");
      return;
    }
    const linkedMedication = medsById[order.medicationId]
    setSelectedOrders(prev => [...prev, order])
    setNewAdministrations(prev => ({
      ...prev,
      [order.id]: {
        case_id: resolvedCaseId,
        case_session_id: params.sessionId,
        medication_order_id: order.id,
        user_id: userId,
        group_id: groupId,

        status: "Given",
        administrator: userName,
        time_offset: 0,
        infusion_rate: order.infusionRate,
        administered_dose: linkedMedication.strength,
        is_in_presim: false,
        notes: '',
      }
    }))

    setIsMultiOrderPopoverOpen(false)
    if (!isMedAdminPanelOpen) {
      setIsMedAdminPanelOpen(true);
    }
    setAssociatedOrders([]);
  }

  const handleMultiOrderPopoverClose = () => {
    setIsMultiOrderPopoverOpen(false)
    setAssociatedOrders([])

  }

  const handleRemoveOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const newOrders = prev.filter(order => order.id !== orderId)
      return newOrders
    })
    setNewAdministrations(prev => {
      const copy = { ...prev };
      delete copy[orderId];
      return copy;
    })
  }

  useSimulationScanner(handleScan)

  const handleTimeColChange = (offset: number | string) => {
    if (typeof offset === "number") {
      setTimeColumnOffset(prev => prev + offset);
    } else if (offset === 'reset') {
      setTimeColumnOffset(prev => prev + (-1 * prev))
    }
  }

  const handleFilterChange = (option: string, checked: boolean | "indeterminate") => {
    setOrderFilter(() => {
      if (checked === true) {
        return option;
      } else {
        return ''
      }
    });
  };

  const handleUpdateAdministration = (medicationOrderId: string, field: keyof StudentMedicationAdministration, value: number | string) => {
    setNewAdministrations(prev => {
      const currentInstance = prev[medicationOrderId];
      if (!currentInstance) return prev;

      return {
        ...prev,
        [medicationOrderId]: {
          ...currentInstance,
          [field]: value
        }
      };
    });
  };

  const handleClearAllSelections = () => {
    setSelectedOrders([]);
    setNewAdministrations({});
    setOrderFilter('')
  };

  const handleClearFilters = () => {
    setOrderFilter('');
    setIsDue(false);
    setIsPopoverOpen(false)
  };


  const handleAdministerMeds = async (newAdministrations: NewAdministrationData) => {
    if (!canEdit) {
      toast.error("Medication documentation is view-only in pre-simulation.");
      return;
    }
    // Update administration time
    const payload = Object.keys(newAdministrations).map(orderId => {
      const currentAdmin = newAdministrations[orderId]
      return {
        ...currentAdmin,
        time_offset: elapsedMinutes,
      };
    });

    const result = await submitMedicationAdministrations(payload, resolvedCaseId, params.sessionId)

    if (!result.success) {
      toast.error(result.message ?? "Failed to save administrations");
      return
    }
    setIsMedAdminPanelOpen(false);
    toast.success(result.message ?? "Medications successfully documented");
    handleClearAllSelections()
    router.refresh();
  }


  const groupedAdministrationsByOrder = useMemo(() => {
    const visibleAdministrations = medicationAdministrations.filter((admin) =>
      isVisibleForSimulationPhase({
        isPresim: Boolean(isPresim),
        isVisibleInPresim: admin.is_in_presim,
        releasePhase: admin.phase,
        currentPhase,
      }),
    );

    return visibleAdministrations.reduce((acc, admin) => {
      if (!acc[admin.medication_order_id || 'no_associated_order']) {
        acc[admin.medication_order_id || 'no_associated_order'] = [];
      }
      acc[admin.medication_order_id || 'no_associated_order'].push(admin)
      return acc
    }, {} as { [orderId: string]: DatabaseMedAdministration[] })
  }, [medicationAdministrations, isPresim, currentPhase]);

  const medsById = useMemo(() => {
    return medications.reduce((acc, med) => {
      acc[med.id] = med;
      return acc;
    }, {} as { [id: string]: AllMedicationTypes });
  }, [medications]);

  const releasedMedicationOrders = useMemo(() => {
    return medicationOrders.filter((order) =>
      isVisibleForSimulationPhase({
        isPresim: Boolean(isPresim),
        isVisibleInPresim: order.visibleInPresim,
        releasePhase: order.phase,
        currentPhase,
      }),
    );
  }, [medicationOrders, isPresim, currentPhase]);

  const filteredMedOrders = useMemo(() => {
    return releasedMedicationOrders.filter((order) => {
      if (!orderFilter && !isDue) {
        return true
      }

      const orderAdmins = groupedAdministrationsByOrder[order.id];
      if (isDue && !orderAdmins?.some((admin) => admin.status === 'Due')) {
        return false;
      }

      if (!orderFilter) return true;

      switch (orderFilter) {
        case "PRN":
          return order.priority === "PRN";
        case "Continuous":
          return order.frequency === "CONTINUOUS";
        case "Scheduled":
          return order.priority !== "PRN" && order.frequency !== "CONTINUOUS";
        default:
          return true;
      }
    });
  }, [orderFilter, isDue, releasedMedicationOrders, groupedAdministrationsByOrder]);


  useEffect(() => {
    setElapsedMinutes(differenceInMinutes(new Date(), anchorDate));

    const interval = setInterval(() => {
      setElapsedMinutes(differenceInMinutes(new Date(), anchorDate));
    }, 60000);

    return () => clearInterval(interval);
  }, [anchorDate]);

  const currentSimTime = anchorDate
    ? addMinutes(anchorDate, elapsedMinutes)
    : new Date();

  const displayColumns = createColumns(currentSimTime, timeColumnOffset);

  if (loading || !simStartTime) {
    return (
      <div className="flex flex-col p-3 gap-3 w-full h-full min-h-0 bg-gray-100">
        <Skeleton className="h-10 w-72 bg-gray-200" />
        <Skeleton className="h-28 w-full bg-gray-200" />
        <Skeleton className="h-28 w-full bg-gray-200" />
        <Skeleton className="h-28 w-full bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-gray-100 p-2 pt-0">
      {associatedOrders.length > 0 &&
        <MultiMedPopover
          isOpen={isMultiOrderPopoverOpen}
          associatedOrders={associatedOrders}
          handleClose={handleMultiOrderPopoverClose}
          handleSelection={handleMultiOrderPopoverChoice}
          medication={medsById[associatedOrders[0].medicationId]}
        />
      }
      <WrongPatientAlert
        scanStatus={isWrongPtScan}
        onWrongScanChange={setIsWrongPtScan}
      />
      <ScanWristbandAlert isOpen={missedPtScan} setIsOpen={setMissedPtScan} />
      <div className="mr-6 flex shrink-0 items-start justify-between gap-2 py-3">
        <div className="space-x-4">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs w-fit h-8 bg-white shadow-xs">
                <Filter className={`${orderFilter ? 'fill-blue-300 stroke-blue-500' : ''}`} />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-4 border rounded-lg shadow">
              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  {filterOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-${option}`}
                        checked={orderFilter.includes(option)}
                        onCheckedChange={(checked) => handleFilterChange(option, checked)}
                      />
                      <Label htmlFor={`filter-${option}`} className="font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
                {filterOptions.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-6 border shadow"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Toggle
            pressed={isDue}
            onPressedChange={setIsDue}
            aria-label="Toggle bookmark"
            size="sm"
            variant="outline"
            className="data-[state=on]:*:[svg]:fill-blue-300 data-[state=on]:*:[svg]:stroke-blue-500 w-fit shrink-0 bg-white h-8 text-xs"
          >
            <ClipboardClock />
            Due
          </Toggle>


          <PatientStatusBadge isScanned={isScanned} />
        </div>
        <div className='flex gap-4 xl:gap-20 2xl:gap-45'>
          <ColumnShiftControl
            columns={displayColumns}
            onColumnShift={handleTimeColChange}
            columnOffset={timeColumnOffset}
          />
          <MedAdministrationPanel
            selectedOrders={selectedOrders}
            newAdministrations={newAdministrations}
            onUpdateAdministration={handleUpdateAdministration}
            onClearAll={handleClearAllSelections}
            medicationLookup={medsById}
            administrationsLookup={groupedAdministrationsByOrder}
            sessionStart={anchorDate}
            isScanned={isScanned}
            onPtScan={setIsScanned}
            onAdministerMeds={handleAdministerMeds}
            isOpen={isMedAdminPanelOpen}
            handlePopoverClose={setIsMedAdminPanelOpen}
            onOrderRemove={handleRemoveOrder}
            isPresim={isPresim ?? true}
            readOnly={!canEdit}
            elapsedMinutes={elapsedMinutes}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 w-full flex-col gap-4 overflow-y-auto rounded-tl-lg border border-gray-300 px-2 py-3 inset-shadow-sm">
        {filteredMedOrders.length === 0 && (
          <div className="h-52 border-2 mt-8 mx-4 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
            <PillBottle className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-medium">No orders match the selected filters.</p>
            <p className="text-sm">Clear filters to view all orders.</p>
          </div>
        )}
        {filteredMedOrders.map((order) => {
          const associatedMedication = medsById[order.medicationId]
          const orderSpecifcAdministrations = groupedAdministrationsByOrder[order.id] || [];

          if (!associatedMedication) {
            console.warn(`Med ${order.medicationId} not found for order ${order.id}`)
            return null
          }

          return (
            <MedCard
              key={order.id}
              medication={associatedMedication}
              administrations={orderSpecifcAdministrations}
              order={order}
              columns={displayColumns}
              sessionStart={anchorDate}
              isHighlightableColumn={timeColumnOffset === 0}
              elapsedSimMinutes={elapsedMinutes}
              isPresim={isPresim ?? false}
              currentPhase={currentPhase}
            />
          )
        })}
      </div>
    </div>
  )
}
