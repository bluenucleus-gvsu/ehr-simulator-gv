import { test, expect, Page } from "@playwright/test";
import { authState } from "@/../playwright/helpers/auth";
import { flexSheetSectionNameMap, specialtyDefaultSections } from "@/lib/caseBuilder/defaultTableTemplates";
import { CaseSpecialty } from "@/lib/flexSheet/flexSheetTemplate";
import { FlexSheetSection, flexSheetSections } from "@/lib/flexSheet/flexSheetSections";

async function expectTemplateCheckboxStates(page: Page, expected: FlexSheetSection[]) {
  for (const [key, value] of Object.entries(flexSheetSectionNameMap) as [FlexSheetSection, string][]) {
    const checkbox = await page.getByRole('checkbox', { name: value });

    await expect(checkbox).toBeVisible();

    if (expected.includes(key)) {
      await expect(checkbox).toBeChecked();
    } else {
      await expect(checkbox).not.toBeChecked();
    }
  }
}

async function expectFlexSheetSectionsVisible(page: Page, expected: FlexSheetSection[]) {
  for (const sectionName of Object.keys(flexSheetSections) as FlexSheetSection[]) {
    const section = flexSheetSections[sectionName]
    const titleRow = section.find((row) => row.rowType === "titleRow")
    if (!titleRow) continue;

    if (expected.includes(sectionName)) {
      await expect(page.getByTestId(titleRow.field)).toBeVisible();
    } else {
      await expect(page.getByTestId(titleRow.field)).not.toBeVisible();
    }
  }
}

test.use({ storageState: authState("admin") });

test("FlexSheet Template Form renders correct defaults", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "DASHBOARD" })).toBeVisible();

  await page.getByRole('button', { name: 'Create New Case' }).click();

  // Case-Builder Demographics
  await expect(page).toHaveURL('/admin/case-builder/form/demographics');
  await page.locator('#summary').fill('Flexsheet Text Case Summary');
  await page.locator('#caseSpecialty').click();
  await page.getByRole('option', { name: 'OB' }).click();
  await expect(page.locator('#caseSpecialty')).toHaveText('OB');
  await page.locator('#firstName').fill('Jimmy');
  await page.locator('#lastName').fill('Houston');
  await page.locator('#age').fill('45');
  await page.locator("#codeStatus").click();
  await page.getByRole('option', { name: 'Partial' }).click();
  await expect(page.locator('#codeStatus')).toHaveText('Partial');
  await page.locator('#heightFeet').fill('5');
  await page.locator('#heightInches').fill('6');
  await page.locator('#dosingWeight').fill('70');
  await page.locator("#isolationPrecations").click();
  await page.getByRole('option', { name: 'Airborne' }).click();
  await expect(page.locator('#isolationPrecations')).toHaveText('Airborne');
  await page.locator('#language').fill('English');
  await page.locator("#insurance").click();
  await page.getByRole('option', { name: 'Medicaid' }).click();
  await expect(page.locator('#insurance')).toHaveText('Medicaid');
  await page.locator('#employment').fill('Teacher');
  await page.locator("#relationshipStatus").click();
  await page.getByRole('option', { name: 'Single' }).click();
  await expect(page.locator('#relationshipStatus')).toHaveText('Single');
  await page.locator('#religion').fill('Catholic');
  await page.locator('#needsInterpreter').check();
  await page.locator('#admittingDiagnosis').fill('Acute Appendicitis');
  await page.locator("#attendingProviderTitle").click();
  await page.getByRole('option', { name: 'MD' }).click();
  await expect(page.locator('#attendingProviderTitle')).toHaveText('MD');
  await page.locator('#attendingProviderName').fill('John Smith');
  await page.locator('#patientContact').fill('Mary Doe');
  await page.locator('#contactRelationship').fill('Spouse');
  await page.locator('#contactPhone').fill('(555) 123-4567');
  await page.locator('#contactPhone').fill('(555) 123-4567');

  // FlexSheet Template Form
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/admin\/case-builder\/form\/history\?caseId=[0-9a-f-]{36}$/i);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/admin\/case-builder\/form\/notes\?caseId=[0-9a-f-]{36}$/i);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/admin\/case-builder\/form\/orders\?caseId=[0-9a-f-]{36}$/i);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/admin\/case-builder\/form\/table-template\?caseId=[0-9a-f-]{36}$/i);
  const currentUrl = page.url();
  const urlObj = new URL(currentUrl);
  const caseId = urlObj.searchParams.get('caseId');
  expect(caseId).not.toBeNull()
  await expectTemplateCheckboxStates(page, specialtyDefaultSections[CaseSpecialty.OB]);

  for (const name of ['Vital Signs', 'Input Rows', 'Output Rows']) {
    await page.getByRole('checkbox', { name }).click();
  }
  await expect(page.getByRole('checkbox', { name: 'Vital Signs' })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'HEENT Assessment' })).toBeChecked();
  await page.getByRole('button', { name: 'Revert to Default Selection' }).click();
  await expectTemplateCheckboxStates(page, specialtyDefaultSections[CaseSpecialty.OB]);

  // Admin Cases page and EHR View
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/admin\/case-builder\/form\/labs\?caseId=[0-9a-f-]{36}$/i);
  await page.getByRole('link', { name: 'Cases' }).click();
  await expect(page).toHaveURL(/\/admin\/cases/);
  await page.locator("#caseSpecialty").click();
  await page.getByRole('option', { name: 'OB' }).click();
  await expect(page.locator('#caseSpecialty')).toHaveText('OB');
  await page.getByTestId(`button-${caseId}`).click()
  await expect(page).toHaveURL(/\/simulation\/[0-9a-f-]{36}\/preview\/chart\/overview/);
  await page.locator("#charting").click();
  await expectFlexSheetSectionsVisible(page, specialtyDefaultSections[CaseSpecialty.OB]);

  // Back to Case-Builder form to customize FlexSheet template
  await page.goto('/admin');
  await expect(page.getByRole("heading", { name: "DASHBOARD" })).toBeVisible();
  await page.getByRole('link', { name: 'Cases' }).click();
  await expect(page).toHaveURL(/\/admin\/cases/);
  await page.locator("#caseSpecialty").click();
  await page.getByRole('option', { name: 'OB' }).click();
  await page.getByTestId(`edit-${caseId}`).click();
  await expect(page).toHaveURL(new RegExp(`/admin/case-builder/form/demographics\\?caseId=${caseId}$`));
  await page.goto(`/admin/case-builder/form/table-template?caseId=${caseId}`);
  await expect(page.getByRole('checkbox', { name: 'Wound Assessment' })).toBeVisible();

  const customSections = specialtyDefaultSections[CaseSpecialty.OB].filter((s) => s !== FlexSheetSection.VITALS);
  customSections.push(FlexSheetSection.WOUND);

  await page.getByRole('checkbox', { name: 'Vital Signs' }).click();
  await page.getByRole('checkbox', { name: 'Wound Assessment' }).click();
  await expectTemplateCheckboxStates(page, customSections);
  await page.locator('#continue').click();
  await expect(page).toHaveURL(/\/admin\/case-builder\/form\/labs\?caseId=[0-9a-f-]{36}$/i);

  // Return to the EHR flexsheets and validate the custom selection
  await page.goto(`/simulation/${caseId}/preview/chart/overview`);
  await expect(page).toHaveURL(/\/simulation\/[0-9a-f-]{36}\/preview\/chart\/overview/);
  await page.locator("#charting").click();
  await expectFlexSheetSectionsVisible(page, customSections);
  await expect(page.getByTestId('Wound Assessment')).toBeVisible();
  await expect(page.getByTestId('Vital Signs')).not.toBeVisible();
});