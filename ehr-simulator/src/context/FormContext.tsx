'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CompleteFormType, defaultIoData, defaultOrders, DemographicFormData, FormBlob, HistoryFormData, IntakeOutputFormData, MedOrderFormData, TableFormData } from '@/utils/form';
import { ClinicalNote } from '@/app/simulation/[caseId]/[sessionId]/chart/notes/components/notesData';
import { OrderType } from '@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData';
import { LabTableData, labTemplate } from '@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData';
import { FlexSheetData, flexSheetTemplate } from '@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData';
import { MedAdministrationInstance } from '@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData';
import { isTesterModeClient } from '@/utils/testerMode';
import { setTesterCaseDraft } from '@/utils/testerLocalStore';
import type { CaseBundle } from '@/actions/case_builder/getCase';
import {
  hydratePhaseCacheFromBundle,
  loadPhaseIntoLiveFields,
  persistLiveFieldsToCache,
} from '@/lib/caseBuilder/hydratePhaseCache';
import {
  dedupeMedicationIdsAcrossPhases,
  medOrderIdsInOtherPhases,
} from '@/lib/caseBuilder/remapMedicationOrderIds';
import {
  applyPhaseCountResolutions,
  carryOverScopeFromPrevious,
  ensureScopePhaseInitialized,
  listPhasesWithSavedData,
  phaseByScopeFromCache,
  type PhaseRestoreChoice,
} from '@/lib/caseBuilder/phaseCacheOps';
import {
  clampPhaseCount,
  createEmptyPhaseCache,
  DEFAULT_PHASE_COUNT,
  defaultPhaseByScope,
  PHASE_TAB_SCOPES,
  type PhaseByScope,
  type PhaseScopedCache,
  type PhaseScopeState,
  type PhaseTabScope,
} from '@/lib/casePhases';

export type { PhaseTabScope, PhaseScopeState, PhaseByScope };

export type CaseBuilderSaveSnapshot = {
  blob: FormBlob;
  phaseCount: number;
  phaseByScope: PhaseByScope;
  phaseCache: PhaseScopedCache;
};

interface FormContextType {
  demographicData: DemographicFormData;
  historyData: HistoryFormData;
  noteData: ClinicalNote[];
  orderData: OrderType[];
  labData: TableFormData<LabTableData>;
  chartingData: TableFormData<FlexSheetData>;
  ioData: IntakeOutputFormData[];
  medOrderData: MedOrderFormData;
  medAdministrationData: MedAdministrationInstance[];
  caseId?: string;
  phaseCount: number;
  phaseByScope: PhaseByScope;
  setCaseId: (id: string) => void;
  applyPhaseCountChange: (
    count: number,
    resolutions?: Record<number, PhaseRestoreChoice>,
  ) => void;
  switchActivePhase: (scope: PhaseTabScope, phase: number) => void;
  createNextPhase: (scope: PhaseTabScope) => boolean;
  registerPhaseScope: (scope: PhaseTabScope) => void;
  getPhasesWithSavedData: (fromPhase: number, toPhase: number) => number[];
  initializeFromCaseBundle: (bundle: CaseBundle) => void;
  restorePhaseState: (opts: {
    phaseCount?: number;
    phaseByScope?: PhaseByScope;
    phaseCache?: PhaseScopedCache;
    /** @deprecated use phaseByScope */
    activePhase?: number;
  }) => void;
  onDataChange: (key: keyof FormBlob, data: CompleteFormType) => void;
  registerCaseBuilderLocalOverlay: (fn: (() => Partial<FormBlob>) | null) => void;
  getCaseBuilderSaveBlob: () => FormBlob;
  getCaseBuilderSaveSnapshot: () => CaseBuilderSaveSnapshot;
  getMedicationPhasePayload: (scope: 'medOrders' | 'mar') => {
    phase: number;
    orders: MedOrderFormData['createdOrders'];
    administrations: MedAdministrationInstance[];
  };
  applyCaseBuilderOverlayToContext: () => void;
}

const defaultDemographicData: DemographicFormData = {
  DOBDay: '',
  DOBMonth: '',
  admissionDateOffest: '',
  admissionTime: '',
  admittingDiagnosis: '',
  age: '',
  attendingProviderName: '',
  attendingProviderTitle: '',
  codeStatus: '',
  dosingWeight: '',
  employment: '',
  firstName: '',
  heightFeet: '',
  heightInches: '',
  insurance: '',
  language: '',
  needsInterpreter: false,
  lastName: '',
  precautions: '',
  relationshipStatus: '',
  religion: '',
  summary: '',
  contact: '',
  contactRelationship: '',
  contactPhone: '',
};
const defaultHistoryData = {
  medicalHistory: [],
  surgicalHistory: [],
  allergies: [],
  socialHistory: [],
  livingSituation: [],
  alerts: [],
  familyHistory: [],
};
const emptyFormBlob = (): FormBlob => ({
  demographics: defaultDemographicData,
  history: defaultHistoryData,
  notes: [],
  orders: [],
  labs: { data: [], timePoints: [0], timePointsInPreSim: new Set(), visibleItems: new Set() },
  charting: { data: [], timePoints: [0], timePointsInPreSim: new Set(), visibleItems: new Set() },
  intakeOutput: defaultIoData,
  medOrders: { createdOrders: [], selectedMeds: [] },
  medAdministrationInstances: [],
});

const FormContext = createContext<FormContextType>({
  onDataChange: () => {},
  setCaseId: () => {},
  caseId: undefined,
  phaseCount: DEFAULT_PHASE_COUNT,
  phaseByScope: defaultPhaseByScope(),
  applyPhaseCountChange: () => {},
  switchActivePhase: () => {},
  createNextPhase: () => false,
  registerPhaseScope: () => {},
  getPhasesWithSavedData: () => [],
  initializeFromCaseBundle: () => {},
  restorePhaseState: () => {},
  demographicData: defaultDemographicData,
  historyData: defaultHistoryData,
  noteData: [],
  orderData: [],
  labData: { data: [], timePoints: [0], timePointsInPreSim: new Set(), visibleItems: new Set() },
  chartingData: { data: [], timePoints: [0], timePointsInPreSim: new Set(), visibleItems: new Set() },
  ioData: defaultIoData,
  medOrderData: { createdOrders: [], selectedMeds: [] },
  medAdministrationData: [],
  registerCaseBuilderLocalOverlay: () => {},
  getCaseBuilderSaveBlob: emptyFormBlob,
  getCaseBuilderSaveSnapshot: () => ({
    blob: emptyFormBlob(),
    phaseCount: DEFAULT_PHASE_COUNT,
    phaseByScope: defaultPhaseByScope(),
    phaseCache: createEmptyPhaseCache(),
  }),
  getMedicationPhasePayload: () => ({
    phase: 1,
    orders: [],
    administrations: [],
  }),
  applyCaseBuilderOverlayToContext: () => {},
});

function clampScopeState(state: PhaseScopeState, phaseCount: number): PhaseScopeState {
  const highest = Math.min(state.highestInitializedPhase, phaseCount);
  const active = Math.min(state.activePhase, highest);
  return { activePhase: Math.max(1, active), highestInitializedPhase: Math.max(1, highest) };
}

export function FormContextProvider({ children }: { children: React.ReactNode }) {
  const caseBuilderLocalOverlayRef = useRef<(() => Partial<FormBlob>) | null>(null);
  const phaseCacheRef = useRef<PhaseScopedCache>(createEmptyPhaseCache());
  const phaseByScopeRef = useRef<PhaseByScope>(defaultPhaseByScope());
  const lastRegisteredScopeRef = useRef<PhaseTabScope | null>(null);

  const [caseId, setCaseId] = useState<string | undefined>(undefined);
  const [phaseCount, setPhaseCount] = useState(DEFAULT_PHASE_COUNT);
  const [phaseByScope, setPhaseByScope] = useState<PhaseByScope>(defaultPhaseByScope);
  phaseByScopeRef.current = phaseByScope;
  const [demographicData, setDemographicData] = useState<DemographicFormData>(defaultDemographicData);
  const [historyData, setHistoryData] = useState<HistoryFormData>(defaultHistoryData);
  const [noteData, setNoteData] = useState<ClinicalNote[]>([]);
  const [orderData, setOrderData] = useState<OrderType[]>(defaultOrders);
  const [labData, setLabData] = useState<TableFormData<LabTableData>>({
    data: labTemplate,
    timePoints: [0],
    timePointsInPreSim: new Set<number>(),
    visibleItems: new Set(),
  });
  const [chartingData, setChartingData] = useState<TableFormData<FlexSheetData>>({
    data: flexSheetTemplate,
    timePoints: [0],
    timePointsInPreSim: new Set<number>(),
    visibleItems: new Set(),
  });
  const [ioData, setIoData] = useState<IntakeOutputFormData[]>(defaultIoData);
  const [medOrderData, setMedOrderData] = useState<MedOrderFormData>({ createdOrders: [], selectedMeds: [] });
  const [medAdministrationData, setMedAdministrationData] = useState<MedAdministrationInstance[]>([]);

  const orderDataRef = useRef(orderData);
  const labDataRef = useRef(labData);
  const medOrderDataRef = useRef(medOrderData);
  const medAdministrationDataRef = useRef(medAdministrationData);
  orderDataRef.current = orderData;
  labDataRef.current = labData;
  medOrderDataRef.current = medOrderData;
  medAdministrationDataRef.current = medAdministrationData;

  const flushScopeToCache = useCallback((scope: PhaseTabScope) => {
    const phase = phaseByScopeRef.current[scope].activePhase;
    const overlay = caseBuilderLocalOverlayRef.current?.() ?? {};
    const current = loadPhaseIntoLiveFields(phaseCacheRef.current, phase);

    switch (scope) {
      case 'orders':
        phaseCacheRef.current = persistLiveFieldsToCache(phaseCacheRef.current, phase, {
          ...current,
          orders: overlay.orders ?? orderDataRef.current,
        });
        break;
      case 'labs':
        phaseCacheRef.current = persistLiveFieldsToCache(phaseCacheRef.current, phase, {
          ...current,
          labs: overlay.labs ?? labDataRef.current,
        });
        break;
      case 'medOrders':
        phaseCacheRef.current = persistLiveFieldsToCache(phaseCacheRef.current, phase, {
          ...current,
          medOrders: overlay.medOrders ?? medOrderDataRef.current,
        });
        break;
      case 'mar':
        phaseCacheRef.current = persistLiveFieldsToCache(phaseCacheRef.current, phase, {
          ...current,
          medOrders: overlay.medOrders ?? medOrderDataRef.current,
          medAdmins: overlay.medAdministrationInstances ?? medAdministrationDataRef.current,
        });
        break;
    }
  }, []);

  const applyScopeToLiveFields = useCallback((scope: PhaseTabScope, phase: number) => {
    const loaded = loadPhaseIntoLiveFields(phaseCacheRef.current, phase);
    switch (scope) {
      case 'orders':
        setOrderData(loaded.orders.length > 0 ? loaded.orders : []);
        break;
      case 'labs':
        setLabData(loaded.labs);
        break;
      case 'medOrders':
        setMedOrderData(loaded.medOrders);
        setMedAdministrationData(loaded.medAdmins);
        break;
      case 'mar':
        setMedOrderData(loaded.medOrders);
        setMedAdministrationData(loaded.medAdmins);
        break;
    }
  }, []);

  const registerPhaseScope = useCallback(
    (scope: PhaseTabScope) => {
      const prev = lastRegisteredScopeRef.current;
      if (prev && prev !== scope) {
        flushScopeToCache(prev);
      }
      lastRegisteredScopeRef.current = scope;
      applyScopeToLiveFields(scope, phaseByScopeRef.current[scope].activePhase);
    },
    [flushScopeToCache, applyScopeToLiveFields],
  );

  const switchActivePhase = useCallback(
    (scope: PhaseTabScope, phase: number) => {
      const scopeState = phaseByScopeRef.current[scope];
      const next = clampPhaseCount(phase);
      if (next > scopeState.highestInitializedPhase || next < 1) return;
      flushScopeToCache(scope);
      phaseCacheRef.current = ensureScopePhaseInitialized(phaseCacheRef.current, scope, next);
      setPhaseByScope((prev) => ({
        ...prev,
        [scope]: { ...prev[scope], activePhase: next },
      }));
      applyScopeToLiveFields(scope, next);
    },
    [flushScopeToCache, applyScopeToLiveFields],
  );

  const createNextPhase = useCallback(
    (scope: PhaseTabScope): boolean => {
      const scopeState = phaseByScopeRef.current[scope];
      if (scopeState.highestInitializedPhase >= phaseCount) return false;
      const next = scopeState.highestInitializedPhase + 1;
      flushScopeToCache(scope);
      phaseCacheRef.current = carryOverScopeFromPrevious(phaseCacheRef.current, scope, next);
      setPhaseByScope((prev) => ({
        ...prev,
        [scope]: { activePhase: next, highestInitializedPhase: next },
      }));
      applyScopeToLiveFields(scope, next);
      return true;
    },
    [phaseCount, flushScopeToCache, applyScopeToLiveFields],
  );

  const getPhasesWithSavedData = useCallback((fromPhase: number, toPhase: number) => {
    return listPhasesWithSavedData(phaseCacheRef.current, fromPhase, toPhase);
  }, []);

  const applyPhaseCountChange = useCallback(
    (count: number, resolutions: Record<number, PhaseRestoreChoice> = {}) => {
      const next = clampPhaseCount(count);
      const prev = phaseCount;
      const scope = lastRegisteredScopeRef.current;
      if (scope) flushScopeToCache(scope);

      if (next > prev) {
        phaseCacheRef.current = applyPhaseCountResolutions(
          phaseCacheRef.current,
          prev,
          next,
          resolutions,
        );
      }

      setPhaseCount(next);
      setPhaseByScope((prevScopes) => {
        const updated = { ...prevScopes };
        for (const s of PHASE_TAB_SCOPES) {
          updated[s] = clampScopeState(prevScopes[s], next);
        }
        return updated;
      });
      if (scope) {
        applyScopeToLiveFields(scope, Math.min(phaseByScopeRef.current[scope].activePhase, next));
      }
    },
    [phaseCount, flushScopeToCache, applyScopeToLiveFields],
  );

  const initializeFromCaseBundle = useCallback(
    (bundle: CaseBundle) => {
      const row = bundle.caseRow ?? {};
      const count = clampPhaseCount(Number(row.phase_count ?? DEFAULT_PHASE_COUNT));
      const cache = hydratePhaseCacheFromBundle(bundle);
      phaseCacheRef.current = cache;
      lastRegisteredScopeRef.current = null;
      setPhaseCount(count);
      setPhaseByScope(phaseByScopeFromCache(cache, count));
    },
    [],
  );

  const restorePhaseState = useCallback(
    (opts: {
      phaseCount?: number;
      phaseByScope?: PhaseByScope;
      activePhase?: number;
      phaseCache?: PhaseScopedCache;
    }) => {
      if (opts.phaseCache) {
        phaseCacheRef.current = opts.phaseCache;
      }
      const count = clampPhaseCount(opts.phaseCount ?? phaseCount);
      setPhaseCount(count);
      let resolved: PhaseByScope;
      if (opts.phaseByScope) {
        resolved = { ...defaultPhaseByScope() };
        for (const s of PHASE_TAB_SCOPES) {
          resolved[s] = clampScopeState(opts.phaseByScope[s] ?? defaultPhaseByScope()[s], count);
        }
      } else if (opts.activePhase !== undefined) {
        const legacyPhase = Math.min(clampPhaseCount(opts.activePhase), count);
        const fromCache = phaseByScopeFromCache(phaseCacheRef.current, count);
        resolved = { ...fromCache };
        for (const s of PHASE_TAB_SCOPES) {
          resolved[s] = {
            activePhase: legacyPhase,
            highestInitializedPhase: Math.max(fromCache[s].highestInitializedPhase, legacyPhase),
          };
        }
      } else {
        resolved = phaseByScopeFromCache(phaseCacheRef.current, count);
      }
      phaseByScopeRef.current = resolved;
      setPhaseByScope(resolved);
      const scope = lastRegisteredScopeRef.current;
      if (scope) {
        applyScopeToLiveFields(scope, resolved[scope].activePhase);
      }
    },
    [phaseCount, applyScopeToLiveFields],
  );

  const syncTesterDraft = useCallback(
    (_key: keyof FormBlob, nextDraft: FormBlob) => {
      if (caseId && isTesterModeClient()) {
        setTesterCaseDraft(caseId, {
          ...nextDraft,
          phaseCount,
          phaseByScope: phaseByScopeRef.current,
          phaseCache: phaseCacheRef.current,
        } as unknown as Record<string, unknown>);
      }
    },
    [caseId, phaseCount],
  );

  const onDataChange = (key: keyof FormBlob, value: CompleteFormType) => {
    const nextDraft: FormBlob = {
      demographics: key === 'demographics' ? (value as DemographicFormData) : demographicData,
      history: key === 'history' ? (value as HistoryFormData) : historyData,
      notes: key === 'notes' ? (value as ClinicalNote[]) : noteData,
      orders: key === 'orders' ? (value as OrderType[]) : orderData,
      labs: key === 'labs' ? (value as TableFormData<LabTableData>) : labData,
      charting: key === 'charting' ? (value as TableFormData<FlexSheetData>) : chartingData,
      intakeOutput: key === 'intakeOutput' ? (value as IntakeOutputFormData[]) : ioData,
      medOrders: key === 'medOrders' ? (value as MedOrderFormData) : medOrderData,
      medAdministrationInstances:
        key === 'medAdministrationInstances'
          ? (value as MedAdministrationInstance[])
          : medAdministrationData,
    };
    syncTesterDraft(key, nextDraft);

    switch (key) {
      case 'demographics':
        setDemographicData(value as DemographicFormData);
        break;
      case 'history':
        setHistoryData(value as HistoryFormData);
        break;
      case 'notes':
        setNoteData(value as ClinicalNote[]);
        break;
      case 'orders':
        setOrderData(value as OrderType[]);
        break;
      case 'labs':
        setLabData(value as TableFormData<LabTableData>);
        break;
      case 'charting':
        setChartingData(value as TableFormData<FlexSheetData>);
        break;
      case 'intakeOutput':
        setIoData(value as IntakeOutputFormData[]);
        break;
      case 'medOrders':
        setMedOrderData(value as MedOrderFormData);
        break;
      case 'medAdministrationInstances':
        setMedAdministrationData(value as MedAdministrationInstance[]);
        break;
    }
  };

  const registerCaseBuilderLocalOverlay = useCallback((fn: (() => Partial<FormBlob>) | null) => {
    caseBuilderLocalOverlayRef.current = fn;
  }, []);

  const buildBlobFromState = useCallback((): FormBlob => {
    const overlay = caseBuilderLocalOverlayRef.current?.() ?? {};
    return {
      demographics: overlay.demographics ?? demographicData,
      history: overlay.history ?? historyData,
      notes: overlay.notes ?? noteData,
      orders: overlay.orders ?? orderData,
      labs: overlay.labs ?? labData,
      charting: overlay.charting ?? chartingData,
      intakeOutput: overlay.intakeOutput ?? ioData,
      medOrders: overlay.medOrders ?? medOrderData,
      medAdministrationInstances: overlay.medAdministrationInstances ?? medAdministrationData,
    };
  }, [
    demographicData,
    historyData,
    noteData,
    orderData,
    labData,
    chartingData,
    ioData,
    medOrderData,
    medAdministrationData,
  ]);

  const getCaseBuilderSaveBlob = useCallback((): FormBlob => {
    const scope = lastRegisteredScopeRef.current;
    if (scope) flushScopeToCache(scope);
    const base = buildBlobFromState();
    const cache = phaseCacheRef.current;
    const ordersPhase = phaseByScopeRef.current.orders.activePhase;
    const labsPhase = phaseByScopeRef.current.labs.activePhase;
    const medOrdersPhase = phaseByScopeRef.current.medOrders.activePhase;
    const marPhase = phaseByScopeRef.current.mar.activePhase;
    const ordersLoaded = loadPhaseIntoLiveFields(cache, ordersPhase);
    const labsLoaded = loadPhaseIntoLiveFields(cache, labsPhase);
    const medLoaded = loadPhaseIntoLiveFields(cache, medOrdersPhase);
    const marLoaded = loadPhaseIntoLiveFields(cache, marPhase);
    return {
      ...base,
      orders: ordersLoaded.orders,
      labs: labsLoaded.labs,
      medOrders: medLoaded.medOrders,
      medAdministrationInstances: marLoaded.medAdmins,
    };
  }, [buildBlobFromState, flushScopeToCache]);

  const getMedicationPhasePayload = useCallback((scope: 'medOrders' | 'mar') => {
    flushScopeToCache(scope);
    const phase = phaseByScopeRef.current[scope].activePhase;
    const data = loadPhaseIntoLiveFields(phaseCacheRef.current, phase);
    const overlay = caseBuilderLocalOverlayRef.current?.() ?? {};
    const liveOrders =
      scope === 'medOrders' && overlay.medOrders?.createdOrders
        ? overlay.medOrders.createdOrders
        : data.medOrders.createdOrders;
    const liveAdmins =
      scope === 'mar' && overlay.medAdministrationInstances
        ? overlay.medAdministrationInstances
        : data.medAdmins;

    const idsInOtherPhases = medOrderIdsInOtherPhases(
      phaseCacheRef.current.medOrders,
      phase,
    );
    const { orders, administrations } = dedupeMedicationIdsAcrossPhases(
      { createdOrders: liveOrders, selectedMeds: data.medOrders.selectedMeds },
      liveAdmins,
      idsInOtherPhases,
    );

    const remapped = liveOrders.some((o) => idsInOtherPhases.has(o.id));
    if (remapped) {
      phaseCacheRef.current = persistLiveFieldsToCache(phaseCacheRef.current, phase, {
        ...data,
        medOrders: { createdOrders: orders, selectedMeds: data.medOrders.selectedMeds },
        medAdmins: administrations,
      });
      setMedOrderData({ createdOrders: orders, selectedMeds: data.medOrders.selectedMeds });
      setMedAdministrationData(administrations);
    }

    return { phase, orders, administrations };
  }, [flushScopeToCache]);

  const getCaseBuilderSaveSnapshot = useCallback((): CaseBuilderSaveSnapshot => {
    const scope = lastRegisteredScopeRef.current;
    if (scope) flushScopeToCache(scope);
    return {
      blob: buildBlobFromState(),
      phaseCount,
      phaseByScope: structuredClone(phaseByScopeRef.current),
      phaseCache: structuredClone(phaseCacheRef.current),
    };
  }, [phaseCount, buildBlobFromState, flushScopeToCache]);

  const applyCaseBuilderOverlayToContext = useCallback(() => {
    const overlay = caseBuilderLocalOverlayRef.current?.() ?? {};
    (Object.keys(overlay) as (keyof FormBlob)[]).forEach((key) => {
      const val = overlay[key];
      if (val !== undefined) {
        onDataChange(key, val as CompleteFormType);
      }
    });
  }, [onDataChange]);

  return (
    <FormContext.Provider
      value={{
        caseId,
        setCaseId,
        phaseCount,
        phaseByScope,
        applyPhaseCountChange,
        switchActivePhase,
        createNextPhase,
        registerPhaseScope,
        getPhasesWithSavedData,
        initializeFromCaseBundle,
        restorePhaseState,
        demographicData,
        historyData,
        noteData,
        orderData,
        labData,
        chartingData,
        ioData,
        medOrderData,
        medAdministrationData,
        onDataChange,
        registerCaseBuilderLocalOverlay,
        getCaseBuilderSaveBlob,
        getCaseBuilderSaveSnapshot,
        getMedicationPhasePayload,
        applyCaseBuilderOverlayToContext,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  return useContext(FormContext);
}

/** Per-tab phase controls (Orders, Labs, Med Orders, MAR each track their own phases). */
export function usePhaseTab(scope: PhaseTabScope) {
  const ctx = useFormContext();
  const scopeState = ctx.phaseByScope[scope];
  return {
    phaseCount: ctx.phaseCount,
    activePhase: scopeState.activePhase,
    highestInitializedPhase: scopeState.highestInitializedPhase,
    switchActivePhase: (phase: number) => ctx.switchActivePhase(scope, phase),
    createNextPhase: () => ctx.createNextPhase(scope),
    registerPhaseScope: () => ctx.registerPhaseScope(scope),
    getMedicationSavePayload:
      scope === 'medOrders' || scope === 'mar'
        ? () => ctx.getMedicationPhasePayload(scope)
        : undefined,
  };
}
