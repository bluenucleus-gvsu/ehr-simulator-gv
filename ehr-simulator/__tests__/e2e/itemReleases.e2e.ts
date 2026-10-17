import { test, expect, type Browser, type Page } from "@playwright/test";

import { authState, createServiceClient } from "../../playwright/helpers/auth";

test.describe.configure({ mode: "serial" });

const CASE_ID = "e5f6a7b8-c9d0-4e5f-9b1a-4c5d6e7f8a9d";
const SECTION_ID = "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e";
const GROUP_ID = "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f";
const GROUP_NAME = "Group A";
const FACULTY_EMAIL = "e2e.faculty@gvsu.edu";

let sessionId: string;

const RELEASE_TABLES = [
  "lab_result_releases",
  "clinical_document_releases",
  "order_releases",
  "medication_order_releases",
] as const;

const BASELINE_SODIUM = ["138", "136"];
const PHASE_2_SODIUM = ["134", "131", "133", "132"];
const PHASE_3_SODIUM = ["129", "128", "127"];

const chartUrl = (tab: string) => `/simulation/${CASE_ID}/${sessionId}/chart/${tab}`;

let facultyUrl: string;

const startSession = async (startedMinutesAgo = 5) => {
  const service = createServiceClient();
  const { error } = await service
    .from("case_sessions")
    .update({
      started_at: new Date(Date.now() - startedMinutesAgo * 60_000).toISOString(),
      status: "in progress",
    })
    .eq("id", sessionId);
  if (error) throw new Error(`Failed to start session: ${error.message}`);
};

const stopSession = async () => {
  const service = createServiceClient();
  const { error } = await service
    .from("case_sessions")
    .update({ started_at: null, status: "assigned" })
    .eq("id", sessionId);
  if (error) throw new Error(`Failed to reset session: ${error.message}`);
};

const clearReleases = async () => {
  const service = createServiceClient();
  for (const table of RELEASE_TABLES) {
    const { error } = await service.from(table).delete().eq("session_id", sessionId);
    if (error) throw new Error(`Failed to clear ${table}: ${error.message}`);
  }
};

const countVisible = async (page: Page, values: string[]) => {
  const visible = await Promise.all(
    values.map((value) =>
      page
        .getByText(value, { exact: true })
        .first()
        .isVisible()
        .catch(() => false),
    ),
  );
  return visible.filter(Boolean).length;
};

const openReleasePanel = async (page: Page) => {
  await page.goto(facultyUrl);
  await expect(page.getByRole("heading", { name: "Wallace Peterson" })).toBeVisible();
  const groupCard = page.getByTestId(`group-card-${GROUP_ID}`);
  await groupCard.getByRole("button", { name: "View Releasable Items" }).click();
  await expect(page.getByText(`Release Content – ${GROUP_NAME}`)).toBeVisible();
};

const phaseCard = (page: Page, phase: number) => page.getByTestId(`release-phase-card-${phase}`);

const releaseItemByName = (page: Page, phase: number, name: string) =>
  phaseCard(page, phase).getByTestId(`release-item-${name}`);

const openStudentChart = async (browser: Browser, tab: string) => {
  const context = await browser.newContext({ storageState: authState("student") });
  const page = await context.newPage();
  await page.goto(chartUrl(tab));

  await expect(page.getByText("Wallace Peterson")).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1_500);
  return { context, page };
};

const newRolePage = async (browser: Browser, role: "faculty" | "admin") => {
  const context = await browser.newContext({ storageState: authState(role) });
  return { context, page: await context.newPage() };
};

test.beforeAll(async () => {
  const service = createServiceClient();

  const { data: sessions } = await service
    .from("case_sessions")
    .select("id, section_assignments!inner(section_id, case_id, id)")
    .eq("group_id", GROUP_ID)
    .eq("section_assignments.section_id", SECTION_ID)
    .eq("section_assignments.case_id", CASE_ID)
    .limit(1);
  if (!sessions?.length) {
    throw new Error("trigger-created Wallace session for Group A not found");
  }
  sessionId = sessions[0].id;

  const { data: facultyUser } = await service
    .from("users")
    .select("id")
    .eq("email", FACULTY_EMAIL)
    .single();
  if (!facultyUser) throw new Error("e2e faculty user not provisioned");

  const embedded = (
    sessions[0] as unknown as { section_assignments: { id: string } | { id: string }[] }
  ).section_assignments;
  const assignment = Array.isArray(embedded) ? embedded[0] : embedded;
  if (!assignment) throw new Error("section assignment join missing on session");
  facultyUrl = `/faculty/${facultyUser.id}/${assignment.id}`;
});

test.afterAll(async () => {
  await clearReleases();
  await stopSession();
});

test.beforeEach(async () => {
  await clearReleases();
});

test.describe("Faculty releases item, student receives notification", () => {
  test("faculty releases phase 2, the student chart updates, and un-release removes a column live", async ({ browser }) => {
    await startSession();

    const faculty = await newRolePage(browser, "faculty");
    await openReleasePanel(faculty.page);

    await expect(phaseCard(faculty.page, 2)).toContainText("4 Lab panels");
    await expect(phaseCard(faculty.page, 3)).toContainText("3 Lab panels");
    await expect(faculty.page.getByTestId("released-items-heading")).toHaveCount(0);

    await phaseCard(faculty.page, 2).getByRole("button", { name: "Release all" }).click();
    await expect(faculty.page.getByText(`Phase 2 released to ${GROUP_NAME}.`)).toBeVisible();
    await expect(faculty.page.getByTestId("released-items-heading")).toContainText("(8)");
    await expect(phaseCard(faculty.page, 2)).toContainText("No items to release");

    const student = await openStudentChart(browser, "labs");
    await expect(student.page.getByText("134", { exact: true })).toBeVisible();
    expect(await countVisible(student.page, BASELINE_SODIUM)).toBe(2);
    expect(await countVisible(student.page, PHASE_2_SODIUM)).toBe(4);
    expect(await countVisible(student.page, PHASE_3_SODIUM)).toBe(0);

    await faculty.page.getByTestId("unrelease-item-Phase 2 BMP").click();
    await expect(faculty.page.getByText("Content removed from this group's chart.")).toBeVisible();
    await expect
      .poll(async () => countVisible(student.page, PHASE_2_SODIUM), { timeout: 10_000 })
      .toBe(3);

    await faculty.context.close();
    await student.context.close();
  });
});

test.describe("phase 1 rendering", () => {
  test("a pre-release session shows only baseline columns in the chart and overview", async ({ browser }) => {
    await startSession();

    const labs = await openStudentChart(browser, "labs");
    await expect(labs.page.getByText("138", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect
      .poll(() => countVisible(labs.page, BASELINE_SODIUM), { timeout: 15_000 })
      .toBe(2);
    expect(await countVisible(labs.page, PHASE_2_SODIUM)).toBe(0);
    expect(await countVisible(labs.page, PHASE_3_SODIUM)).toBe(0);
    await labs.context.close();

    const overview = await openStudentChart(browser, "overview");
    await expect(overview.page.getByText("Selected Labs")).toBeVisible();
    await expect(overview.page.getByText("136", { exact: true })).toBeVisible();
    await expect(overview.page.getByText("4.3", { exact: true })).toBeVisible();
    await overview.context.close();
  });
});

test.describe("EHR overview lab card reflects releases", () => {
  test("releasing a lab result makes it the most recent value in Overview lab card", async ({ browser }) => {
    await startSession();

    const faculty = await newRolePage(browser, "faculty");
    await openReleasePanel(faculty.page);

    // Release only the "Phase 2 BMP" staged column (sodium 134 / potassium 4.6).
    await releaseItemByName(faculty.page, 2, "Phase 2 BMP").click();
    await expect(faculty.page.getByText(`released to ${GROUP_NAME}.`)).toBeVisible();
    await expect(faculty.page.getByTestId("released-items-heading")).toContainText("(1)");

    const overview = await openStudentChart(browser, "overview");
    await expect(overview.page.getByText("134", { exact: true })).toBeVisible();
    await expect(overview.page.getByText("4.6", { exact: true })).toBeVisible();

    await faculty.page.getByTestId("unrelease-item-Phase 2 BMP").click();
    await expect(faculty.page.getByText("Content removed from this group's chart.")).toBeVisible();
    await expect(overview.page.getByText("136", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(overview.page.getByText("4.3", { exact: true })).toBeVisible({ timeout: 10_000 });

    await faculty.context.close();
    await overview.context.close();
  });
});

test.describe("item release notification in student EHR", () => {
  test("notifies student within the debounce window and cancelled releases do not notify", async ({ browser }) => {
    await startSession();

    const faculty = await newRolePage(browser, "faculty");
    await openReleasePanel(faculty.page);

    const student = await openStudentChart(browser, "overview");

    await releaseItemByName(faculty.page, 2, "Phase 2 BMP").click();
    await expect(faculty.page.getByText(`released to ${GROUP_NAME}.`)).toBeVisible();

    const dialog = student.page.getByTestId("release-update-dialog");
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(student.page.getByText("New 1 lab panel available.")).toBeVisible();
    await student.page.getByRole("button", { name: "Open Labs" }).click();
    await expect(student.page).toHaveURL(new RegExp("/chart/labs$"));

    await faculty.page.getByTestId("unrelease-item-Phase 2 BMP").click();
    await expect(faculty.page.getByText("Content removed from this group's chart.")).toBeVisible();
    await releaseItemByName(faculty.page, 2, "Phase 2 BMP").click();
    await faculty.page.getByTestId("unrelease-item-Phase 2 BMP").click();
    await expect.poll(() => countVisible(student.page, PHASE_2_SODIUM)).toBe(0);
    await expect(student.page.getByTestId("release-update-dialog")).toHaveCount(0);

    await faculty.context.close();
    await student.context.close();
  });
});

test.describe("case-builder case creation round trip", () => {
  test("admin edits course, faculty see new lab items", async ({ browser }) => {
    const admin = await newRolePage(browser, "admin");
    const labsFormUrl = `/admin/case-builder/form/labs?caseId=${CASE_ID}`;

    await admin.page.goto(labsFormUrl);

    await expect(admin.page.getByText("Faculty Release")).toHaveCount(7);
    await expect(admin.page.getByText("Phase 2 BMP")).toBeVisible();

    await admin.page.getByRole("button", { name: "Add Faculty-Released Column" }).click();
    await expect(admin.page.getByText("Faculty Release")).toHaveCount(8);

    await admin.page.getByRole("combobox").last().click();
    await admin.page.getByRole("option", { name: "3", exact: true }).click();
    await admin.page.getByRole("button", { name: "Add label" }).last().click();
    await admin.page.getByText("Label for Faculty").waitFor();
    await admin.page.getByPlaceholder("e.g. BMP — 1h post-diuresis").fill("E2E staged column");
    await admin.page.getByRole("button", { name: "Add Label", exact: true }).click();

    await admin.page.getByRole("button", { name: "Continue" }).click();
    await admin.page.waitForURL((url) => !url.pathname.endsWith("/form/labs"), { timeout: 15_000 });
    await admin.page.goto(labsFormUrl);
    await expect(admin.page.getByText("Faculty Release")).toHaveCount(8);

    const faculty = await newRolePage(browser, "faculty");
    await openReleasePanel(faculty.page);
    await expect(phaseCard(faculty.page, 3)).toContainText("4 Lab panels");
    await expect(phaseCard(faculty.page, 3)).toContainText("E2E staged column");

    // Remove the column this test added
    const service = createServiceClient();
    const { error } = await service
      .from("lab_results")
      .delete()
      .eq("case_id", CASE_ID)
      .eq("label", "E2E staged column");
    if (error) throw new Error(`Failed to clean up staged column: ${error.message}`);

    await admin.context.close();
    await faculty.context.close();
  });
});