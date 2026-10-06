import { test, expect, Page } from "@playwright/test";
import { authState, authenticatedContext } from "@/../playwright/helpers/auth";
import {
  createFixtureDb,
  expectSessionStatus,
  getUserIdByEmail,
  runArchiveDueJob,
  setSessionStatus,
  E2E_EMAILS,
  type FixtureDb,
} from "@/../playwright/helpers/fixtures";


test.use({ storageState: authState("faculty") });

let db: FixtureDb;

test.beforeEach(() => {
  db = createFixtureDb();
});
test.afterEach(async () => {
  await db.cleanup();
});

async function openFacultyPage(page: Page, facultyId: string) {
  await page.goto(`/faculty/${facultyId}`);
  await openAllDetails(page);
}

async function openAllDetails(page: Page) {
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.evaluate(() => {
      document.querySelectorAll("details").forEach((details) => {
        details.open = true;
      });
    });
    await page.waitForTimeout(250);
    const allOpen = await page.evaluate(
      () => Array.from(document.querySelectorAll("details")).every((details) => details.open),
    );
    if (allOpen) return;
  }
  throw new Error("openAllDetails: <details> elements never stayed open");
}

function assignmentCard(page: Page, assignmentId: string) {
  return page.locator(`[data-assignment-id="${assignmentId}"]`);
}

test("Upcoming sim shows the Upcoming badge", async ({ page }) => {
  const facultyId = await getUserIdByEmail(E2E_EMAILS.faculty);
  const course = await db.createCourse();
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: 12,
    simOffsetHours: 24,
  });

  await openFacultyPage(page, facultyId);
  await expect(assignmentCard(page, assignment.assignment.id).getByText("Upcoming")).toBeVisible();
});

test("Today's sim shows Enter Simulation which routes to the simulation detail view", async ({ page }) => {
  const facultyId = await getUserIdByEmail(E2E_EMAILS.faculty);
  const course = await db.createCourse();
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -1,
    simOffsetHours: 1,
  });

  await openFacultyPage(page, facultyId);

  const card = assignmentCard(page, assignment.assignment.id);
  await card.getByRole("button", { name: "Enter Simulation" }).click();

  await expect(page).toHaveURL(new RegExp(`/faculty/${facultyId}/${assignment.assignment.id}$`));
  await expect(page.getByRole("heading", { name: "Assigned Groups" })).toBeVisible();
});

test("Past sim within the archive window shows Past due", async ({ page }) => {
  const facultyId = await getUserIdByEmail(E2E_EMAILS.faculty);
  const course = await db.createCourse();
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -24,
    simOffsetHours: -23,
  });

  await openFacultyPage(page, facultyId);
  await expect(assignmentCard(page, assignment.assignment.id).getByText("Past due")).toBeVisible();
});

test("Completed assignment shows Completed and no Enter button", async ({ page }) => {
  const facultyId = await getUserIdByEmail(E2E_EMAILS.faculty);
  const course = await db.createCourse();
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -25,
    simOffsetHours: -24,
  });
  for (const sessionId of assignment.sessionIds) {
    await setSessionStatus(sessionId, "completed");
  }

  await openFacultyPage(page, facultyId);

  const card = assignmentCard(page, assignment.assignment.id);
  await expect(card.getByText("Completed")).toBeVisible();
  await expect(card.getByRole("button", { name: "Enter Simulation" })).toHaveCount(0);
});

test("Mixed completed and archived sessions resolve to Archived (archived wins)", async ({ page }) => {
  const facultyId = await getUserIdByEmail(E2E_EMAILS.faculty);
  const course = await db.createCourse({ groups: [{}, {}] });
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -25,
    simOffsetHours: -24,
  });
  await setSessionStatus(assignment.sessionIds[0], "completed");
  await setSessionStatus(assignment.sessionIds[1], "archived");

  await openFacultyPage(page, facultyId);

  await expect(assignmentCard(page, assignment.assignment.id).getByText("Archived")).toBeVisible();
});

test("The scheduled archival job archives old (>24hr past sim_time) assignments; student profile reflects Past Sessions", async ({ browser, page }) => {
  const facultyId = await getUserIdByEmail(E2E_EMAILS.faculty);
  const studentId = await getUserIdByEmail(E2E_EMAILS.student);

  const course = await db.createCourse({ groups: [{ studentIds: [studentId] }] });
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -49,
    simOffsetHours: -48,
  });

  await openFacultyPage(page, facultyId);
  await expect(assignmentCard(page, assignment.assignment.id).getByText("Past due")).toBeVisible();

  await runArchiveDueJob();

  const session = await expectSessionStatus(assignment.sessionIds[0]);
  expect(session.status).toBe("archived");
  expect(session.archived_at).toBeTruthy();
  expect(session.completed_at).toBeNull();

  await openFacultyPage(page, facultyId);
  await expect(assignmentCard(page, assignment.assignment.id).getByText("Archived")).toBeVisible();

  const studentContext = await authenticatedContext(browser, "student");
  const studentPage = await studentContext.newPage();

  await studentPage.goto(`/user/profile/${studentId}`);
  await openAllDetails(studentPage);
  const studentCard = studentPage.locator(`[data-session-id="${assignment.sessionIds[0]}"]`);

  await expect(studentCard).toBeVisible();
  await expect(
    studentPage
      .locator("details")
      .filter({ has: studentPage.locator("summary", { hasText: "Past Sessions" }) })
      .filter({ has: studentCard }),
  ).toHaveCount(1);

  await studentContext.close();
});
