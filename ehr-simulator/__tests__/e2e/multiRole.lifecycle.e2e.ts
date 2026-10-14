import { test, expect, type Page } from "@playwright/test";
import { authState, authenticatedContext } from "../../playwright/helpers/auth";
import {
  createFixtureDb,
  expectSessionStatus,
  getUserIdByEmail,
  updateAssignmentTimes,
  E2E_EMAILS,
  type FixtureDb,
} from "../../playwright/helpers/fixtures";

test.use({ storageState: authState("admin") });

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

test("cross-role lifecycle: future → active → completed → archived", async ({ page, browser }) => {
  const db: FixtureDb = createFixtureDb();
  const studentId = await getUserIdByEmail(E2E_EMAILS.student);
  const facultyId = await getUserIdByEmail(E2E_EMAILS.faculty);

  const studentContext = await authenticatedContext(browser, "student");
  const studentPage = await studentContext.newPage();
  const facultyContext = await authenticatedContext(browser, "faculty");
  const facultyPage = await facultyContext.newPage();

  try {
    const course = await db.createCourse({ groups: [{ studentIds: [studentId] }] });
    const simCase = await db.createCase();
    const assignment = await db.assignCase({
      caseId: simCase.case.id,
      sectionId: course.section.id,
      presimOffsetHours: 1,
      simOffsetHours: 24,
    });

    await page.goto(`/admin/courses/${course.course.id}`);
    const adminRow = page.getByRole("row").filter({ hasText: simCase.case.name });
    await expect(adminRow).toBeVisible();

    await studentPage.goto(`/user/profile/${studentId}`);
    await openAllDetails(studentPage);
    const studentCard = studentPage.locator(`[data-session-id="${assignment.sessionIds[0]}"]`);
    await expect(
      studentCard.getByRole("button", { name: `Simulation ${simCase.case.name} not available yet` }),
    ).toBeDisabled();

    await facultyPage.goto(`/faculty/${facultyId}`);
    await openAllDetails(facultyPage);
    const facultyCard = facultyPage.locator(`[data-assignment-id="${assignment.assignment.id}"]`);
    await expect(facultyCard.getByText("Upcoming")).toBeVisible();

    await updateAssignmentTimes(assignment.assignment.id, {
      presimOffsetHours: -1,
      simOffsetHours: -0.5,
    });

    await studentPage.reload();
    await openAllDetails(studentPage);
    await studentCard.getByRole("button", { name: `Start simulation ${simCase.case.name}` }).click();
    await expect(studentPage.getByText("ACTIVE SIM")).toBeVisible();

    await expect(async () => {
      const startedSession = await expectSessionStatus(assignment.sessionIds[0]);
      expect(startedSession.status).toBe("in progress");
      expect(startedSession.started_at).toBeTruthy();
    }).toPass({ timeout: 10_000 });

    await facultyPage.reload();
    await openAllDetails(facultyPage);
    await expect(facultyCard.getByRole("button", { name: "Enter Simulation" })).toBeVisible();

    await page.reload();
    await adminRow.getByRole("button", { name: "Complete" }).click();
    await expect(page.getByText(/Completed 1 session/)).toBeVisible();

    const completedSession = await expectSessionStatus(assignment.sessionIds[0]);
    expect(completedSession.status).toBe("completed");
    expect(completedSession.completed_at).toBeTruthy();
    expect(completedSession.archived_at).toBeNull();

    await studentPage.goto(`/user/profile/${studentId}`);
    await openAllDetails(studentPage);
    const viewChart = studentCard.getByRole("button", { name: `Open read-only chart for ${simCase.case.name}` });
    await expect(viewChart).toBeVisible();
    await expect(
      studentPage
        .locator("details")
        .filter({ has: studentPage.locator("summary", { hasText: "Past Sessions" }) })
        .filter({ has: studentCard }),
    ).toHaveCount(1);

    await facultyPage.reload();
    await openAllDetails(facultyPage);
    await expect(facultyCard.getByText("Completed")).toBeVisible();

    await viewChart.click();
    await expect(studentPage).toHaveURL(
      `/simulation/${simCase.case.id}/${assignment.sessionIds[0]}/chart/overview`,
    );
    await expect(studentPage.getByText("ACTIVE SIM")).toBeVisible();
    const afterVisit = await expectSessionStatus(assignment.sessionIds[0]);
    expect(afterVisit.status).toBe("completed");

    const archivedCase = await db.createCase();
    const archivedAssignment = await db.assignCase({
      caseId: archivedCase.case.id,
      sectionId: course.section.id,
      presimOffsetHours: -49,
      simOffsetHours: -48,
    });

    await page.goto(`/admin/courses/${course.course.id}`);
    const archivedRow = page.getByRole("row").filter({ hasText: archivedCase.case.name });
    await expect(archivedRow.getByText(">24hr past start time")).toBeVisible();
    await archivedRow.getByRole("button", { name: "Archive" }).click();
    await expect(page.getByText(/Archived 1 session/)).toBeVisible();

    const archivedSession = await expectSessionStatus(archivedAssignment.sessionIds[0]);
    expect(archivedSession.status).toBe("archived");
    expect(archivedSession.archived_at).toBeTruthy();
    expect(archivedSession.completed_at).toBeNull();

    await studentPage.goto(`/user/profile/${studentId}`);
    await openAllDetails(studentPage);
    const archivedCard = studentPage.locator(`[data-session-id="${archivedAssignment.sessionIds[0]}"]`);

    await expect(archivedCard.getByRole("button", { name: `Open read-only chart for ${archivedCase.case.name}` })).toBeVisible();
    await expect(
      studentPage
        .locator("details")
        .filter({ has: studentPage.locator("summary", { hasText: "Past Sessions" }) })
        .filter({ has: archivedCard }),
    ).toHaveCount(1);

    await facultyPage.goto(`/faculty/${facultyId}`);
    await openAllDetails(facultyPage);
    const facultyArchivedCard = facultyPage.locator(`[data-assignment-id="${archivedAssignment.assignment.id}"]`);
    await expect(facultyArchivedCard.getByText("Archived")).toBeVisible();
  } finally {

    const teardownErrors: unknown[] = [];
    for (const teardown of [
      () => studentContext.close(),
      () => facultyContext.close(),
      () => db.cleanup(),
    ]) {
      try {
        await teardown();
      } catch (error) {
        teardownErrors.push(error);
      }
    }
    if (teardownErrors.length > 0) {
      console.error("[crossRole] teardown errors:", teardownErrors);
    }
  }
});
