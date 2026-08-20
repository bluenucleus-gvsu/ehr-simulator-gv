'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CompleteFormType, defaultIoData, defaultOrders, DemographicFormData, FormBlob, HistoryFormData, IntakeOutputFormData, MedOrderFormData, MediaImageData, TableFormData } from '@/utils/form';
import { ClinicalNote } from '@/app/simulation/[caseId]/[sessionId]/chart/notes/components/notesData';
import { OrderType } from '@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData';
import { LabTableData, labTemplate } from '@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData';
import { FlexSheetData, flexSheetTemplate } from '@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData';
import { MedAdministrationInstance } from '@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData';

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
  mediaData: MediaImageData[];
  caseId?: string;
  setCaseId: (id: string) => void;
  onDataChange: (key: keyof FormBlob, data: CompleteFormType) => void;
  replaceFormData: (data: FormBlob, caseId: string) => void;
}

export const defaultDemographicData: DemographicFormData = {
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
  phaseCount: 1,
}
export const defaultHistoryData: HistoryFormData = {
  medicalHistory: [],
  surgicalHistory: [],
  allergies: [],
  socialHistory: [],
  livingSituation: [],
  alerts: [],
  familyHistory: []
}
const FormContext = createContext<FormContextType>({
  onDataChange: () => { },
  setCaseId: () => { },
  caseId: undefined,
  demographicData: defaultDemographicData,
  historyData: defaultHistoryData,
  noteData: [],
  orderData: [],
  labData: { data: [], timePoints: [0], timePointsInPreSim: new Set(), visibleItems: new Set() },
  chartingData: { data: [], timePoints: [0], timePointsInPreSim: new Set(), visibleItems: new Set() },
  ioData: defaultIoData,
  medOrderData: { createdOrders: [], selectedMeds: [] },
  medAdministrationData: [],
  mediaData: [],
  replaceFormData: () => { },
});

export function FormContextProvider({ children }: { children: React.ReactNode }) {
  const [caseId, setCaseId] = useState<string | undefined>(undefined);
  const [demographicData, setDemographicData] = useState<DemographicFormData>(defaultDemographicData);
  const [historyData, setHistoryData] = useState<HistoryFormData>(defaultHistoryData);
  const [noteData, setNoteData] = useState<ClinicalNote[]>([]);
  const [orderData, setOrderData] = useState<OrderType[]>(defaultOrders);
  const [labData, setLabData] = useState<TableFormData<LabTableData>>({
    data: labTemplate,
    timePoints: [0],
    timePointsInPreSim: new Set<number>(),
    visibleItems: new Set()
  });
  const [chartingData, setChartingData] = useState<TableFormData<FlexSheetData>>({
    data: flexSheetTemplate,
    timePoints: [0],
    timePointsInPreSim: new Set<number>(),
    visibleItems: new Set()
  });
  const [ioData, setIoData] = useState<IntakeOutputFormData[]>(defaultIoData);
  const [medOrderData, setMedOrderData] = useState<MedOrderFormData>({ createdOrders: [], selectedMeds: [] });
  const [medAdministrationData, setMedAdministrationData] = useState<MedAdministrationInstance[]>([])
  const [mediaData, setMediaData] = useState<MediaImageData[]>([]);

  const onDataChange = useCallback((key: keyof FormBlob, value: CompleteFormType) => {
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
      case 'media':
        setMediaData(value as MediaImageData[]);
        break;
    }
  }, []);

  const replaceFormData = useCallback((data: FormBlob, id: string) => {
    setDemographicData(data.demographics);
    setHistoryData(data.history);
    setNoteData(data.notes);
    setOrderData(data.orders);
    setLabData(data.labs);
    setChartingData(data.charting);
    setIoData(data.intakeOutput);
    setMedOrderData(data.medOrders);
    setMedAdministrationData(data.medAdministrationInstances);
    setMediaData(data.media);
    setCaseId(id);
  }, []);

  return (
    <FormContext.Provider value={{
      caseId,
      setCaseId,
      demographicData,
      historyData,
      noteData,
      orderData,
      labData,
      chartingData,
      ioData,
      medOrderData,
      medAdministrationData,
      mediaData,
      onDataChange,
      replaceFormData,
    }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  return useContext(FormContext);
}
