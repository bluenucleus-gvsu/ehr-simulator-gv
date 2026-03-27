'use client'

import { addMinutes, differenceInMinutes } from 'date-fns'
import MedCard from "@/app/simulation/[sessionId]/chart/mar/components/medCard";
import { useMemo, useState, useEffect } from "react";
import type { MedAdministrationInstance, MedicationOrder } from "./components/marData";
import MedAdministrationPanel from "./components/medAdministrationPanel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { ClipboardClock, Filter, PillBottle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { createColumns } from '@/app/simulation/[sessionId]/chart/mar/components/marHelpers';
import { PatientStatusBadge } from './components/marHelpers';
import ColumnShiftControl from './components/columnShiftControl';
import { useSimulationCase } from "@/context/SimulationCaseContext";
import { buildMarFromCaseBundle } from "./components/marFromBundle";

/** Simulation MAR is rendering-only: no barcode scan simulation and no DB write-back for administrations. */
const MAR_INTERACTION_DISABLED = true;

const filterOptions = ["Scheduled", "Continuous", "PRN"]

export default function Mar() {
  const { caseBundle } = useSimulationCase();

  const { medicationOrders, administrations, medsById } = useMemo(
    () => buildMarFromCaseBundle(caseBundle),
    [caseBundle],
  );

  const [selectedOrders, setSelectedOrders] = useState<MedicationOrder[]>([]);
  const [newAdministrations, setNewAdministrations] = useState<Record<string, MedAdministrationInstance>>({});
  const [isDue, setIsDue] = useState<boolean | undefined>(false)
  const [orderFilter, setOrderFilter] = useState<string>('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isMedAdminPanelOpen, setIsMedAdminPanelOpen] = useState(false);
  const [anchorDate] = useState<Date>(new Date());
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [timeColumnOffset, setTimeColumnOffset] = useState(0)

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

  const handleAdministerMeds = (_medAdmins: MedAdministrationInstance[]) => {
    handleClearAll()
  }

  const groupedAdministrationsByOrder = useMemo(() => {
    return medicationAdministrations.reduce((acc, admin) => {
      if (!acc[admin.medication_order_id || 'no_associated_order']) {
        acc[admin.medication_order_id || 'no_associated_order'] = [];
      }
      acc[admin.medication_order_id || 'no_associated_order'].push(admin)
      return acc
    }, {} as { [orderId: string]: DatabaseMedAdministration[] })
  }, [medicationAdministrations]);

  const isContinuousFrequency = (frequency: string) =>
    frequency === "Continuous" || frequency === "CONTINUOUS";

  const filteredMedOrders = useMemo(() => {
    return medicationOrders.filter((order) => {
      if (isPresim && !order.visibleInPresim) {
        return false
      }

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
          return isContinuousFrequency(order.frequency);
        case "Scheduled":
          return order.priority !== "PRN" && !isContinuousFrequency(order.frequency);
        default:
          return true;
      }
    });
  }, [orderFilter, isDue, groupedAdministrationsByOrder, medicationOrders]);


  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setElapsedMinutes(differenceInMinutes(now, anchorDate));
    }, 60000);

    return () => clearInterval(interval);
  }, [anchorDate]);

  const currentSimTime = anchorDate
    ? addMinutes(anchorDate, elapsedMinutes)
    : new Date();

  const displayColumns = createColumns(currentSimTime, timeColumnOffset);

  const handleMedCheckboxChange = (order: MedicationOrder, checked: boolean) => {
    if (MAR_INTERACTION_DISABLED) return;
    if (checked) {
      setSelectedOrders(prev => [...prev, order]);

      setNewAdministrations(prev => ({
        ...prev,
        [order.id]: {
          medicationOrderId: order.id,
          status: "Given",
          administratorId: "currentUser",
          adminTimeMinuteOffset: 0,
          administeredDose: order.dose,
          visibleInPresim: false
        }
      }));
    } else {
      setSelectedOrders(prev => prev.filter(existingOrder => existingOrder.id !== order.id));

      setNewAdministrations(prev => {
        const copy = { ...prev };
        delete copy[order.id];
        return copy;
      });
    }
  };

  const handleRemoveOrder = (orderId: string) => {
    setSelectedOrders(prev => prev.filter(order => order.id !== orderId))
    setNewAdministrations(prev => {
      const copy = { ...prev };
      delete copy[orderId];
      return copy;
    })
  }

  return (
    <div className="flex flex-col p-2 pt-0 w-full h-[calc(100vh-4rem)] bg-gray-100 overflow-y-auto">
      <div className='flex gap-2 py-3 items-start justify-between mr-6'>
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

          <PatientStatusBadge isScanned={false} />
        </div>

        <div className='flex gap-4 lg:gap-10 xl:gap-30 2xl:gap-45'>
          <ColumnShiftControl
            columns={displayColumns}
            onColumnShift={handleTimeColChange}
            columnOffset={timeColumnOffset}
          />
          <MedAdministrationPanel
            readOnly={MAR_INTERACTION_DISABLED}
            selectedOrders={selectedOrders}
            newAdministrations={newAdministrations}
            onUpdateAdministration={handleUpdateAdministration}
            onClearAll={handleClearAllSelections}
            medicationLookup={medsById}
            administrationsLookup={groupedAdministrationsByOrder}
            sessionStart={anchorDate}
            isScanned={false}
            onPtScan={() => {}}
            onAdministerMeds={handleAdministerMeds}
            isOpen={isMedAdminPanelOpen}
            handlePopoverClose={setIsMedAdminPanelOpen}
            onOrderRemove={handleRemoveOrder}
            isPresim={isPresim ?? true}
            elapsedMinutes={elapsedMinutes}
          />
        </div>
      </div>

      <div className="flex w-full h-full flex-col flex-1 gap-4 px-2 py-3 overflow-y-auto border border-gray-300 rounded-tl-lg inset-shadow-sm">
        {medicationOrders.length === 0 && (
          <div className="h-52 border-2 mt-8 mx-4 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
            <PillBottle className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-medium">No medication data for this case.</p>
            <p className="text-sm">Medication orders and administrations will appear here when present in the case.</p>
          </div>
        )}
        {medicationOrders.length > 0 && filteredMedOrders.length === 0 && (
          <div className="h-52 border-2 mt-8 mx-4 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
            <PillBottle className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-medium">No orders match the selected filters.</p>
            <p className="text-sm">Clear filters to view all orders.</p>
          </div>
        )}
        {filteredMedOrders.map((order) => {
          const isSelected = selectedOrders.includes(order);
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
              onSelectionChange={handleMedCheckboxChange}
              isSelected={isSelected}
              isHighlightableColumn={timeColumnOffset === 0}
              selectionDisabled={MAR_INTERACTION_DISABLED}
            />
          )
        })}
      </div>
    </div>
  )
}
