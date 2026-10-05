import { test, expect, type Page } from "@playwright/test";
import { authState } from "@/../playwright/helpers/auth";
import {
  createFixtureDb,
  expectSessionStatus,
  type FixtureDb,
} from "@/../playwright/helpers/fixtures";

test.use({ storageState: authState("admin") });

let db: FixtureDb;

test.beforeEach(() => {
  db = createFixtureDb();
});

test.afterEach(async () => {
  await db.cleanup();
});

async function openCoursePage(page: Page, courseId: string) {
  await page.goto(`/admin/courses/${courseId}`);
  await expect(page.getByRole("heading", { name: "Assigned Simulations" })).toBeVisible();
}

test("Future Sim assignment is listed under Assigned Simulations with Complete/Archive buttons", async ({ page }) => {
  const course = await db.createCourse();
  const simCase = await db.createCase();

  await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -1,
    simOffsetHours: 24,
  });

  await openCoursePage(page, course.course.id);

  const row = page.getByRole("row").filter({ hasText: simCase.case.name });
  await expect(row).toBeVisible();
  await expect(row.getByRole("button", { name: "Complete" })).toBeVisible();
  await expect(row.getByRole("button", { name: "Archive" })).toBeVisible();
});

test("Complete button moves the assignment to Past Simulations and completes every session", async ({ page }) => {
  const course = await db.createCourse();
  const simCase = await db.createCase();

  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -1,
    simOffsetHours: 24,
  });

  await openCoursePage(page, course.course.id);

  const row = page.getByRole("row").filter({ hasText: simCase.case.name });
  await row.getByRole("button", { name: "Complete" }).click();

  await expect(page.getByText(/Completed 1 session/)).toBeVisible();

  const pastRow = page.getByRole("row").filter({ hasText: simCase.case.name }).filter({ hasText: "Completed" });
  await expect(pastRow).toBeVisible();

  for (const sessionId of assignment.sessionIds) {
    const session = await expectSessionStatus(sessionId);
    expect(session.status).toBe("completed");
    expect(session.completed_at).toBeTruthy();
    expect(session.archived_at).toBeNull();
  }
});

test("Archive sets archived_at and clears completed_at", async ({ page }) => {
  const course = await db.createCourse();
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -49,
    simOffsetHours: -48,
  });

  await openCoursePage(page, course.course.id);

  const row = page.getByRole("row").filter({ hasText: simCase.case.name });
  await row.getByRole("button", { name: "Archive" }).click();

  await expect(page.getByText(/Archived 1 session/)).toBeVisible();

  const archivedRow = page.getByRole("row").filter({ hasText: simCase.case.name }).filter({ hasText: "Archived" });
  await expect(archivedRow).toBeVisible();

  for (const sessionId of assignment.sessionIds) {
    const session = await expectSessionStatus(sessionId);
    expect(session.status).toBe("archived");
    expect(session.archived_at).toBeTruthy();
    expect(session.completed_at).toBeNull();
  }
});

test("Complete button on an old non-terminal assignment yields completed with archived_at null", async ({ page }) => {
  const course = await db.createCourse();
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -49,
    simOffsetHours: -48,
  });

  await openCoursePage(page, course.course.id);

  const row = page.getByRole("row").filter({ hasText: simCase.case.name });
  await row.getByRole("button", { name: "Complete" }).click();

  await expect(page.getByText(/Completed 1 session/)).toBeVisible();

  for (const sessionId of assignment.sessionIds) {
    const session = await expectSessionStatus(sessionId);
    expect(session.status).toBe("completed");
    expect(session.completed_at).toBeTruthy();
    expect(session.archived_at).toBeNull();
  }
});

test("Assignment past its archive window lands in Past Simulations with the amber badge and actions available", async ({ page }) => {
  const course = await db.createCourse();
  const simCase = await db.createCase();
  await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -49,
    simOffsetHours: -48,
  });

  await openCoursePage(page, course.course.id);

  await expect(page.getByRole("heading", { name: "Past Simulations" })).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: simCase.case.name });
  await expect(row).toBeVisible();
  await expect(row.getByText(">24hr past start time")).toBeVisible();
  await expect(row.getByRole("button", { name: "Complete" })).toBeVisible();
  await expect(row.getByRole("button", { name: "Archive" })).toBeVisible();
});
