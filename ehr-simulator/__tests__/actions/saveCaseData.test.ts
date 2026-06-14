import { saveCaseData } from '@/actions/case_builder/caseBuilder'
import { CaseSection } from '@/lib/saveCase'
import { upsertCaseDemographics } from '@/actions/case_builder/upsertCaseDemographics'
import { updatePatientHistory } from '@/actions/case_builder/updatePatientHistory'
import { updateClinicalDocuments } from '@/actions/case_builder/updateClinicalDocuments'
import { updateOrders } from '@/actions/case_builder/updateOrders'
import { updateLabs } from '@/actions/case_builder/updateLabs'
import { updateDocumentationResults } from '@/actions/case_builder/updateDocumentationResults'
import { updateMedications } from '@/actions/case_builder/updateMedications'
import { updateCaseIntakeOutput } from '@/actions/case_builder/updateCaseIntakeOutput'
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest'

vi.mock('@/actions/case_builder/upsertCaseDemographics')
vi.mock('@/actions/case_builder/updatePatientHistory')
vi.mock('@/actions/case_builder/updateClinicalDocuments')
vi.mock('@/actions/case_builder/updateOrders')
vi.mock('@/actions/case_builder/updateLabs')
vi.mock('@/actions/case_builder/updateDocumentationResults')
vi.mock('@/actions/case_builder/updateMedications')
vi.mock('@/actions/case_builder/updateCaseIntakeOutput')
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({})),
}))
vi.mock('@/utils/testerWriteGateway', () => ({
  runWriteForMode: vi.fn((writeFn) => writeFn()),
}))

const CASE_ID = 'test-case-id'
const SUPABASE_MOCK = {}

describe('saveCaseData (from @/actions/case_builder/caseBuilder)', () => {
  beforeEach(() => vi.clearAllMocks())

  // Demographics

  describe('DEMOGRAPHICS (saveCaseData)', () => {
    it('calls upsertCaseDemographics with correct args', async () => {
      (upsertCaseDemographics as Mock).mockResolvedValue({ success: true })

      await saveCaseData({
        section: CaseSection.DEMOGRAPHICS,
        payload: { name: 'John' },
        caseId: CASE_ID,
      })

      expect(upsertCaseDemographics).toHaveBeenCalledWith(SUPABASE_MOCK, { name: 'John' }, CASE_ID)
    })

    it('calls upsertCaseDemographics even without a caseId', async () => {
      (upsertCaseDemographics as Mock).mockResolvedValue({ success: true })

      await saveCaseData({
        section: CaseSection.DEMOGRAPHICS,
        payload: { name: 'Jane' },
        caseId: null,
      })

      expect(upsertCaseDemographics).toHaveBeenCalledWith(SUPABASE_MOCK, { name: 'Jane' }, null)
    })
  })

  // Missing caseId guard

  describe('missing caseId (saveCaseData)', () => {
    const sectionsRequiringCaseId = [
      CaseSection.HISTORY,
      CaseSection.CLINICAL_DOCUMENTS,
      CaseSection.ORDERS,
      CaseSection.LABS,
      CaseSection.DOCUMENTATION,
      CaseSection.INTAKE_OUTPUT,
      CaseSection.MEDICATION_ORDERS,
    ]

    it.each(sectionsRequiringCaseId)(
      'throws "Case ID is required" for %s section when caseId is null',
      async (section) => {
        await expect(
          saveCaseData({ section: section as any, payload: {}, caseId: null })
        ).rejects.toThrow('Case ID is required')
      }
    )
  })

  // History

  describe('HISTORY (saveCaseData)', () => {
    it('calls updatePatientHistory with correct args', async () => {
      (updatePatientHistory as Mock).mockResolvedValue({ success: true })

      await saveCaseData({
        section: CaseSection.HISTORY,
        payload: { notes: 'some history' },
        caseId: CASE_ID,
      })

      expect(updatePatientHistory).toHaveBeenCalledWith(SUPABASE_MOCK, { notes: 'some history' }, CASE_ID)
    })
  })

  // Clinical Documents

  describe('CLINICAL_DOCUMENTS (saveCaseData)', () => {
    it('calls updateClinicalDocuments with correct args', async () => {
      (updateClinicalDocuments as Mock).mockResolvedValue({ success: true })

      await saveCaseData({
        section: CaseSection.CLINICAL_DOCUMENTS,
        payload: { documents: [] },
        caseId: CASE_ID,
      })

      expect(updateClinicalDocuments).toHaveBeenCalledWith(SUPABASE_MOCK, { documents: [] }, CASE_ID)
    })
  })

  // Orders

  describe('ORDERS (saveCaseData)', () => {
    it('calls updateOrders with correct args', async () => {
      (updateOrders as Mock).mockResolvedValue({ success: true })

      await saveCaseData({
        section: CaseSection.ORDERS,
        payload: { orders: [] },
        caseId: CASE_ID,
      })

      expect(updateOrders).toHaveBeenCalledWith(SUPABASE_MOCK, { orders: [] }, CASE_ID)
    })
  })

  // Labs

  describe('LABS (saveCaseData)', () => {
    it('calls updateLabs with correct args', async () => {
      (updateLabs as Mock).mockResolvedValue({ success: true })

      await saveCaseData({
        section: CaseSection.LABS,
        payload: { labs: [] },
        caseId: CASE_ID,
      })

      expect(updateLabs).toHaveBeenCalledWith(SUPABASE_MOCK, { labs: [] }, CASE_ID)
    })
  })

  // Documentation

  describe('DOCUMENTATION (saveCaseData)', () => {
    it('calls updateDocumentationResults with correct args', async () => {
      (updateDocumentationResults as Mock).mockResolvedValue({ success: true })

      await saveCaseData({
        section: CaseSection.DOCUMENTATION,
        payload: { results: [] },
        caseId: CASE_ID,
      })

      expect(updateDocumentationResults).toHaveBeenCalledWith(SUPABASE_MOCK, { results: [] }, CASE_ID)
    })
  })

  // Intake Output

  describe('INTAKE_OUTPUT (saveCaseData)', () => {
    it('calls updateCaseIntakeOutput with correct args', async () => {
      (updateCaseIntakeOutput as Mock).mockResolvedValue({ success: true })

      const payload = [{ type: 'intake', amount: 100 }] as any

      await saveCaseData({
        section: CaseSection.INTAKE_OUTPUT,
        payload,
        caseId: CASE_ID,
      })

      expect(updateCaseIntakeOutput).toHaveBeenCalledWith(SUPABASE_MOCK, payload, CASE_ID)
    })
  })

  // Medication Orders

  describe('MEDICATION_ORDERS (saveCaseData)', () => {
    it('calls updateMedications with correct args', async () => {
      (updateMedications as Mock).mockResolvedValue({ success: true })

      const payload = { orders: [], administrations: [] }

      await saveCaseData({
        section: CaseSection.MEDICATION_ORDERS,
        payload,
        caseId: CASE_ID,
      })

      expect(updateMedications).toHaveBeenCalledWith(SUPABASE_MOCK, payload, CASE_ID)
    })
  })

  // Tester mode

  describe('tester mode (saveCaseData)', () => {
    it('returns tester mode response when runWriteForMode uses fallback', async () => {
      const { runWriteForMode } = await vi.importMock('@/utils/testerWriteGateway')
        ; (runWriteForMode as Mock).mockImplementationOnce((_write: any, testerFn: any) => testerFn())

      const result = await saveCaseData({
        section: CaseSection.DEMOGRAPHICS,
        payload: { name: 'Tester' },
        caseId: CASE_ID,
      })

      expect(result).toMatchObject({
        success: true,
        message: 'Case section saved locally for tester mode.',
        data: {
          caseId: CASE_ID,
          section: CaseSection.DEMOGRAPHICS,
          payload: { name: 'Tester' },
        },
      })
    })
  })
})