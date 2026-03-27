'use client'

import { addMinutes, differenceInMinutes } from 'date-fns'
import MedCard from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/medCard";
import { useEffect, useMemo, useState } from "react";
import type { AllMedicationTypes, MedicationOrder } from "./marData";
import MedAdministrationPanel from "./medAdministrationPanel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { ClipboardClock, Filter, PillBottle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { useSymbologyScanner } from '@use-symbology-scanner/react';
import { MultiMedPopover } from './multiMedPopover';
import { toast } from 'sonner';
import WrongPatientAlert from './wrongPatientAlert';
import { createColumns } from '@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marHelpers';
import { PatientStatusBadge } from './marHelpers';
import ColumnShiftControl from './columnShiftControl';
import { DatabaseMedAdministration, StudentMedicationAdministration, submitMedicationAdministrations } from '@/actions/simulation';
import { useSimSessionContext } from '@/context/SimSessionContext';


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

const patientMRN = 'pt12345678'

const filterOptions = ["Scheduled", "Continuous", "PRN"]
export default function MarView({
  medications,
  medicationOrders,
  medicationAdministrations,
  params
}: MarViewData) {
  // data
  const [selectedOrders, setSelectedOrders] = useState<MedicationOrder[]>([]);
  // const [administrations, setAdministrations] = useState<DatabaseMedAdministration[]>(medicationAdministrations)
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
  // temp time management
  const [anchorDate] = useState<Date>(new Date());
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [timeColumnOffset, setTimeColumnOffset] = useState(0)
  // user data
  const { userId, groupId, isPresim, userName } = useSimSessionContext();
  // Scanner debugging
  // const [scannedSymbol, setScannedSymbol] = useState('')

  const handleScan = (symbol: string) => {
    // handle patient wristband scans
    if (symbol.slice(0, 2) === 'pt') {
      if (symbol === patientMRN) {
        setIsScanned(true);
        return;
      } else {
        if (!isWrongPtScan) {
          setIsWrongPtScan(true);
          return;
        }
      }
    }

    // find all orders that use this medication
    const associatedOrders = medicationOrders.filter(order => order.medicationId === symbol);

    if (associatedOrders.length === 0) {
      toast.info(`No associated orders found with ${symbol}`)
      return
    }

    const existingSelectedOrder = selectedOrders.find(selected =>
      associatedOrders.some(associated => associated.id === selected.id)
    );


    if (!existingSelectedOrder && associatedOrders.length > 1) {
      console.warn("More than one order shares this med")
      setAssociatedOrders(associatedOrders)
      setIsMultiOrderPopoverOpen(true)
      return
    }

    if (!isPopoverOpen) {
      setIsMedAdminPanelOpen(true)
    }
    const targetOrder = existingSelectedOrder || associatedOrders[0];

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
            administered_dose: (currentAdmin.administered_dose || 0) + targetOrder.dose
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
          case_id: params.caseId,
          case_session_id: params.sessionId,
          medication_order_id: targetOrder.id,
          user_id: userId,
          group_id: groupId,

          status: "Given",
          administrator: userName,
          time_offset: 0,
          administered_dose: targetOrder.dose,
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
    setSelectedOrders(prev => [...prev, order])
    setNewAdministrations(prev => ({
      ...prev,
      [order.id]: {
        case_id: params.caseId,
        case_session_id: params.sessionId,
        medication_order_id: order.id,
        user_id: userId,
        group_id: groupId,

        status: "Given",
        administrator: userName,
        time_offset: 0,
        administered_dose: order.dose,
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

  useSymbologyScanner(handleScan,
    {
      scannerOptions: { prefix: '~', suffix: '', maxDelay: 20 },
      symbologies: ["Data Matrix"]
    },
  )

  const handleMedCheckboxChange = (order: MedicationOrder, checked: boolean) => {
    if (!groupId || !userId) {
      toast.error('missing an id')
      return
    }
    if (checked) {
      setSelectedOrders(prev => [...prev, order]);

      setNewAdministrations(prev => ({
        ...prev,
        [order.id]: {
          case_id: params.caseId,
          case_session_id: params.sessionId,
          medication_order_id: order.id,
          user_id: userId,
          group_id: groupId,

          status: "Given",
          administrator: userName,
          time_offset: 0,
          administered_dose: order.dose,
          is_in_presim: false,
          notes: '',
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
    // Update administration time
    const payload = Object.keys(newAdministrations).map(orderId => {
      const currentAdmin = newAdministrations[orderId]
      return {
        ...currentAdmin,
        time_offset: elapsedMinutes,
      };
    });

    const { error } = await submitMedicationAdministrations(payload, params.caseId, params.sessionId)

    if (error) {
      toast.error("Failed to save administrations");
      return
    }
    setIsMedAdminPanelOpen(false);
    toast.success("Medications successfully documented");
    handleClearAllSelections()
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

  const medsById = useMemo(() => {
    return medications.reduce((acc, med) => {
      acc[med.id] = med;
      return acc;
    }, {} as { [id: string]: AllMedicationTypes });
  }, [medications]);

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
          return order.frequency === "CONTINUOUS";
        case "Scheduled":
          return order.priority !== "PRN" && order.frequency !== "CONTINUOUS";
        default:
          return true;
      }
    });
  }, [orderFilter, isDue, medicationOrders, groupedAdministrationsByOrder, isPresim]);


  useEffect(() => {
    // Update the elsapseMinutes every minute
    const interval = setInterval(() => {
      const now = new Date();
      setElapsedMinutes(differenceInMinutes(now, anchorDate));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [anchorDate]);

  const currentSimTime = anchorDate
    ? addMinutes(anchorDate, elapsedMinutes)
    : new Date();

  const displayColumns = createColumns(currentSimTime, timeColumnOffset);

  return (
    <div className="flex flex-col p-2 pt-0 w-full h-[calc(100vh-4rem)] bg-gray-100 overflow-y-auto">
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

          <PatientStatusBadge isScanned={isScanned} />
        </div>

        <div className='flex gap-4 lg:gap-10 xl:gap-30 2xl:gap-45'>
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
            elapsedMinutes={elapsedMinutes}
          />
        </div>
      </div>

      <div className="flex w-full h-full flex-col flex-1 gap-4 px-2 py-3 overflow-y-auto border border-gray-300 rounded-tl-lg inset-shadow-sm">
        {filteredMedOrders.length === 0 && (
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
              isPresim={isPresim ?? false}
            />
          )
        })}
      </div>
    </div>
  )
}
