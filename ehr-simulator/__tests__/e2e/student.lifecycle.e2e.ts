import { test, expect } from "@playwright/test";
import { authState } from "../../playwright/helpers/auth";
import {
  createFixtureDb,
  expectSessionStatus,
  getUserIdByEmail,
  setSessionStatus,
  E2E_EMAILS,
  type FixtureDb,
} from "../../playwright/helpers/fixtures";

test.use({ storageState: authState("student") });

let db: FixtureDb;
let studentId: string;
test.beforeEach(async () => {
  db = createFixtureDb();
  studentId = await getUserIdByEmail(E2E_EMAILS.student);
});
test.afterEach(async () => {
  await db.cleanup();
});

async function openProfile(page: import("@playwright/test").Page) {
  await page.goto(`/user/profile/${studentId}`);
  await openAllDetails(page);
}

async function openAllDetails(page: import("@playwright/test").Page) {
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

function sessionCard(page: import("@playwright/test").Page, sessionId: string) {
  return page.locator(`[data-session-id="${sessionId}"]`);
}

function bucketFor(page: import("@playwright/test").Page, bucket: "Active Sessions" | "Past Sessions", card: ReturnType<typeof sessionCard>) {
  return page
    .locator("details")
    .filter({ has: page.locator("summary", { hasText: bucket }) })
    .filter({ has: card });
}

test("Assigned session before its pre-sim window is not available yet", async ({ page }) => {
  const course = await db.createCourse({ groups: [{ studentIds: [studentId] }] });
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: 24,
    simOffsetHours: 48,
  });

  await openProfile(page);

  const card = sessionCard(page, assignment.sessionIds[0]);
  await expect(
    card.getByRole("button", { name: `Simulation ${simCase.case.name} not available yet` }),
  ).toBeDisabled();
  await expect(card.getByText(/Pre-sim opens/)).toBeVisible();
});

test("Assigned session with an open pre-sim window offers Pre-Sim Mode (view-only chart)", async ({ page }) => {
  const course = await db.createCourse({ groups: [{ studentIds: [studentId] }] });
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -1,
    simOffsetHours: 24,
  });

  await openProfile(page);

  const card = sessionCard(page, assignment.sessionIds[0]);
  await card.getByRole("button", { name: `View pre-sim chart for ${simCase.case.name}` }).click();

  await expect(page).toHaveURL(
    `/simulation/${simCase.case.id}/${assignment.sessionIds[0]}/chart/overview`,
  );
  await expect(page.getByText("PRE-SIM")).toBeVisible();
});

test("Enter Active Simulation marks the session in progress with started_at", async ({ page }) => {
  const course = await db.createCourse({ groups: [{ studentIds: [studentId] }] });
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -2,
    simOffsetHours: -1,
  });

  await openProfile(page);

  const card = sessionCard(page, assignment.sessionIds[0]);
  await card.getByRole("button", { name: `Start simulation ${simCase.case.name}` }).click();

  await expect(page).toHaveURL(
    `/simulation/${simCase.case.id}/${assignment.sessionIds[0]}/chart/overview`,
  );
  await expect(page.getByText("ACTIVE SIM")).toBeVisible();

  const session = await expectSessionStatus(assignment.sessionIds[0]);
  expect(session.status).toBe("in progress");
  expect(session.started_at).toBeTruthy();
});

test("An in-progress session inside the archive window stays enterable (no entry cutoff)", async ({ page }) => {
  const course = await db.createCourse({ groups: [{ studentIds: [studentId] }] });
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -3,
    simOffsetHours: -2,
  });
  await setSessionStatus(assignment.sessionIds[0], "in progress");

  await openProfile(page);

  const card = sessionCard(page, assignment.sessionIds[0]);
  await expect(card.getByRole("button", { name: `Start simulation ${simCase.case.name}` })).toBeVisible();
});

test("Completed session in an active course is reviewable via View Chart (read-only)", async ({ page }) => {
  const course = await db.createCourse({ groups: [{ studentIds: [studentId] }] });
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -25,
    simOffsetHours: -24,
  });
  await setSessionStatus(assignment.sessionIds[0], "completed");

  await openProfile(page);

  const card = sessionCard(page, assignment.sessionIds[0]);
  const viewChart = card.getByRole("button", { name: `Open read-only chart for ${simCase.case.name}` });
  await expect(viewChart).toBeVisible();
  await viewChart.click();

  await expect(page).toHaveURL(
    `/simulation/${simCase.case.id}/${assignment.sessionIds[0]}/chart/overview`,
  );
  await expect(page.getByText("ACTIVE SIM")).toBeVisible();
});

test("Completed session in an inactive course remains reviewable", async ({ page }) => {
  const course = await db.createCourse({
    active: false,
    groups: [{ studentIds: [studentId] }],
  });
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -25,
    simOffsetHours: -24,
  });
  await setSessionStatus(assignment.sessionIds[0], "completed");

  await openProfile(page);

  const card = sessionCard(page, assignment.sessionIds[0]);
  await expect(card.getByRole("button", { name: `Open read-only chart for ${simCase.case.name}` })).toBeVisible();
});

test("Archived session without feedback is still reviewable from the Past bucket", async ({ page }) => {
  const course = await db.createCourse({ groups: [{ studentIds: [studentId] }] });
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -25,
    simOffsetHours: -24,
  });
  await setSessionStatus(assignment.sessionIds[0], "archived");

  await openProfile(page);

  const card = sessionCard(page, assignment.sessionIds[0]);
  await expect(card.getByRole("button", { name: `Open read-only chart for ${simCase.case.name}` })).toBeVisible();
  await expect(bucketFor(page, "Past Sessions", card)).toHaveCount(1);
});

test("A student in two groups of one course sees both sessions under one course card", async ({ page }) => {
  const course = await db.createCourse({ groups: [{ studentIds: [studentId] }, { studentIds: [studentId] }] });
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -1,
    simOffsetHours: 24,
  });
  expect(assignment.sessionIds).toHaveLength(2);

  await openProfile(page);

  const cardA = sessionCard(page, assignment.sessionIds[0]);
  const cardB = sessionCard(page, assignment.sessionIds[1]);

  await expect(cardA).toBeVisible();
  await expect(cardB).toBeVisible();
  await expect(bucketFor(page, "Active Sessions", cardA)).toHaveCount(1);
  await expect(bucketFor(page, "Active Sessions", cardB)).toHaveCount(1);
});

test("Inactive membership keeps terminal history visible and hides non-terminal sessions", async ({ page }) => {
  const course = await db.createCourse({
    groups: [
      { inactiveStudentIds: [studentId] },
      { inactiveStudentIds: [studentId] },
    ],
  });
  const completedCase = await db.createCase();
  const openCase = await db.createCase();

  const completedAssignment = await db.assignCase({
    caseId: completedCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -25,
    simOffsetHours: -24,
  });
  await db.assignCase({
    caseId: openCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -1,
    simOffsetHours: 24,
  });

  const firstGroupSession = course.groupIds
    .map((groupId) => completedAssignment.sessionIdByGroup[groupId])
    .find(Boolean);
  if (!firstGroupSession) throw new Error("No session for first group");
  await setSessionStatus(firstGroupSession, "completed");

  await openProfile(page);

  const card = sessionCard(page, firstGroupSession);
  await expect(card.getByRole("button", { name: `View feedback for ${completedCase.case.name}` })).toBeVisible();

  await expect(page.getByText(openCase.case.name, { exact: true })).toHaveCount(0);
});

test("Active sessions are sorted latest-first by sim time", async ({ page }) => {
  const course = await db.createCourse({ groups: [{ studentIds: [studentId] }] });
  const laterCase = await db.createCase();
  const earlierCase = await db.createCase();
  const laterAssignment = await db.assignCase({
    caseId: laterCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: 23,
    simOffsetHours: 48,
  });
  const earlierAssignment = await db.assignCase({
    caseId: earlierCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: 11,
    simOffsetHours: 24,
  });

  await openProfile(page);

  const laterCard = sessionCard(page, laterAssignment.sessionIds[0]);
  const earlierCard = sessionCard(page, earlierAssignment.sessionIds[0]);
  await expect(laterCard).toBeVisible();
  await expect(earlierCard).toBeVisible();

  const laterComesFirst = await page.evaluate(
    ([laterId, earlierId]) => {
      const later = document.querySelector(`[data-session-id="${laterId}"]`);
      const earlier = document.querySelector(`[data-session-id="${earlierId}"]`);
      if (!later || !earlier) return false;
      return Boolean(later.compareDocumentPosition(earlier) & Node.DOCUMENT_POSITION_FOLLOWING);
    },
    [laterAssignment.sessionIds[0], earlierAssignment.sessionIds[0]],
  );
  expect(laterComesFirst).toBe(true);
});

test("Card fields render distinct labels vs values", async ({ page }) => {
  const course = await db.createCourse({ groups: [{ studentIds: [studentId] }] });
  const simCase = await db.createCase();
  const assignment = await db.assignCase({
    caseId: simCase.case.id,
    sectionId: course.section.id,
    presimOffsetHours: -1,
    simOffsetHours: 24,
  });

  await openProfile(page);

  const card = sessionCard(page, assignment.sessionIds[0]);
  for (const label of ["Sim:", "Pre-sim:", "Group:"]) {
    await expect(card.getByText(label, { exact: true })).toBeVisible();
  }
});
