import { beforeEach, describe, expect, it, vi } from "vitest";
import { getManagedUsers, updateUserRole } from "@/actions/userManagement";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), profile: vi.fn(), createClient: vi.fn(), update: vi.fn(), range: vi.fn(), saved: vi.fn(), revalidate: vi.fn(),
}));
vi.mock("@/utils/supabase/server", () => ({ createServerSupabase: async () => ({
  auth: { getUser: mocks.getUser },
  from: () => ({ select: () => ({ eq: () => ({ single: mocks.profile }) }) }),
}) }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/devAdminEmails", () => ({ emailIsDevAdminAllowlist: () => false }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: "admin" } }, error: null });
  mocks.profile.mockResolvedValue({ data: { role: "admin" }, error: null });
  mocks.saved.mockResolvedValue({ data: { id: "target" }, error: null });
  mocks.update.mockReturnValue({ eq: () => ({ select: () => ({ single: mocks.saved }) }) });
  mocks.createClient.mockReturnValue({ from: () => ({
    update: mocks.update, select: () => ({ order: () => ({ range: mocks.range }) }),
  }) });
});

describe("user management authorization", () => {
  it.each(["student", "faculty"])("rejects role changes from %s users", async role => {
    mocks.profile.mockResolvedValue({ data: { role }, error: null });
    expect((await updateUserRole("target", "admin")).success).toBe(false);
    expect(mocks.createClient).not.toHaveBeenCalled();
    await expect(getManagedUsers()).rejects.toThrow("permission");
  });
  it("rejects unauthenticated users", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await updateUserRole("target", "admin")).success).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("validates roles received at runtime", async () => {
    // @ts-expect-error Exercise an untrusted action payload.
    expect((await updateUserRole("target", "owner")).success).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("allows admins to update any user, including themselves", async () => {
    expect(await updateUserRole("admin", "faculty")).toEqual({ success: true });
    expect(mocks.update).toHaveBeenCalledWith({ role: "faculty" });
    expect(mocks.revalidate).toHaveBeenCalled();
  });
  it("reports failed writes without reporting success", async () => {
    mocks.saved.mockResolvedValue({ data: null, error: { message: "missing" } });
    expect((await updateUserRole("target", "admin")).success).toBe(false);
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});

it("loads every role and deduplicates student sections and faculty classes", async () => {
  const course = { id: "c", code: "NUR 101", name: "Nursing" };
  const section = { id: "s", name: "01", courses: course };
  const base = { full_name: null, email: null, group_members: [], faculty_section: [] };
  mocks.range.mockResolvedValue({ data: [
    { ...base, id: "student", role: "student", group_members: [
      { groups: { sections: section } }, { groups: { sections: section } },
      { groups: { sections: { ...section, id: "s2", name: "02" } } }, { groups: null },
    ] },
    { ...base, id: "faculty", role: "faculty", faculty_section: [{ sections: section }] },
    { ...base, id: "admin", role: "admin" },
  ], error: null });
  const users = await getManagedUsers();
  expect(users).toHaveLength(3);
  expect(users.find(u => u.id === "student")).toMatchObject({
    sections: ["NUR 101 — 01", "NUR 101 — 02"], classes: ["NUR 101 — Nursing"],
  });
  expect(users.find(u => u.id === "faculty")).toMatchObject({ sections: [], classes: ["NUR 101 — Nursing"] });
  expect(users.find(u => u.id === "admin")).toMatchObject({ sections: [], classes: [] });
});
