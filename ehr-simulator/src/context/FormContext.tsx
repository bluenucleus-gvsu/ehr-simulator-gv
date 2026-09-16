'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CompleteFormType, defaultIoData, defaultOrders, DemographicFormData, FormBlob, HistoryFormData, IntakeOutputFormData, MedOrderFormData, MediaImageData, TableFormData } from '@/utils/form';
import { ClinicalNote } from '@/app/simulation/[caseId]/[sessionId]/chart/notes/components/notesData';
import { OrderType } from '@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData';
import { LabTableData, labTemplate } from '@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData';
import { MedAdministrationInstance } from '@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData';
import { buildTableTemplate, CaseSpecialty } from '@/lib/flexSheet/flexSheetTemplate';
import { FlexSheetData } from '@/lib/flexSheet/flexSheetTypes';
import { FlexSheetSection } from '@/lib/flexSheet/flexSheetSections';
import { CaseSection } from '@/lib/saveCase';

interface FormContextType {
  demographicData: DemographicFormData;
  historyData: HistoryFormData;
  noteData: ClinicalNote[];
  orderData: OrderType[];
  tableTemplateData: FlexSheetSection[];
  labData: TableFormData<LabTableData>;
  chartingData: TableFormData<FlexSheetData>;
  ioData: IntakeOutputFormData[];
  medOrderData: MedOrderFormData;
  medAdministrationData: MedAdministrationInstance[];
  mediaData: MediaImageData[];
  caseId?: string;
  setCaseId: (id: string) => void;
  onDataChange: (key: CaseSection, data: CompleteFormType) => void;
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
  caseSpecialty: CaseSpecialty.MED_SURG,
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
  tableTemplateData: [],
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
  const [tableTemplateData, setTableTemplateData] = useState<FlexSheetSection[]>([]);
  const [labData, setLabData] = useState<TableFormData<LabTableData>>({
    data: labTemplate,
    timePoints: [0],
    timePointsInPreSim: new Set<number>(),
    visibleItems: new Set()
  });
  const [chartingData, setChartingData] = useState<TableFormData<FlexSheetData>>({
    data: buildTableTemplate(new Set(tableTemplateData)),
    timePoints: [0],
    timePointsInPreSim: new Set<number>(),
    visibleItems: new Set()
  });
  const [ioData, setIoData] = useState<IntakeOutputFormData[]>(defaultIoData);
  const [medOrderData, setMedOrderData] = useState<MedOrderFormData>({ createdOrders: [], selectedMeds: [] });
  const [medAdministrationData, setMedAdministrationData] = useState<MedAdministrationInstance[]>([])
  const [mediaData, setMediaData] = useState<MediaImageData[]>([]);

  const onDataChange = useCallback((key: CaseSection, value: CompleteFormType) => {
    switch (key) {
      case CaseSection.DEMOGRAPHICS:
        setDemographicData(value as DemographicFormData);
        break;
      case CaseSection.HISTORY:
        setHistoryData(value as HistoryFormData);
        break;
      case CaseSection.CLINICAL_DOCUMENTS:
        setNoteData(value as ClinicalNote[]);
        break;
      case CaseSection.ORDERS:
        setOrderData(value as OrderType[]);
        break;
      case CaseSection.TABLE_TEMPLATE:
        setTableTemplateData(value as FlexSheetSection[])
        break;
      case CaseSection.LABS:
        setLabData(value as TableFormData<LabTableData>);
        break;
      case CaseSection.DOCUMENTATION:
        setChartingData(value as TableFormData<FlexSheetData>);
        break;
      case CaseSection.INTAKE_OUTPUT:
        setIoData(value as IntakeOutputFormData[]);
        break;
      case CaseSection.MEDICATION_ORDERS:
        setMedOrderData(value as MedOrderFormData);
        break;
      case CaseSection.MEDICATION_ADMINISTRATIONS:
        setMedAdministrationData(value as MedAdministrationInstance[]);
        break;
      case CaseSection.MEDIA:
        setMediaData(value as MediaImageData[]);
        break;
    }
  }, []);

  const replaceFormData = useCallback((data: FormBlob, id: string) => {
    setDemographicData(data.demographics);
    setHistoryData(data.history);
    setNoteData(data.notes);
    setOrderData(data.orders);
    setTableTemplateData(data.tableTemplate)
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
      tableTemplateData,
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
