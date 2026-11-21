export const routes = {
  home: {
    getHref: () => "/",
    // Route of each user group's home page
    forRole: (
      role: string | null | undefined,
      userId: string,
    ): string => {
      if (role === "admin") return routes.admin.getHref();
      if (role === "faculty") return routes.admin.getHref();
      if (role === "student" && userId) return routes.user.getHref(userId);
      return routes.auth.unprovisioned.getHref();
    },
  },

  auth: {
    e2e: { getHref: () => "/auth/e2e-login" },
    login: { getHref: () => "/auth/login" },
    callback: { getHref: () => "/auth/callback" },
    unprovisioned: { getHref: () => "/auth/unprovisioned" }
  },

  admin: {
    getHref: () => "/admin",
    cases: { getHref: () => "/admin/cases" },
    barcodes: { getHref: () => "/admin/barcodes" },
    caseBuilderMaintenance: { getHref: () => "/admin/case-builder-maintenance" },
    caseBuilder: {
      root: "/admin/case-builder", // intentionally a string for proxy.ts
      form: {
        getHref: (step: string, caseId?: string | null): string => {
          const path = `/admin/case-builder/form/${step}`;
          if (!caseId) return path;
          return `${path}?caseId=${encodeURIComponent(caseId)}`;
        },
      },
    },
    courses: {
      getHref: () => "/admin/courses",
      new: { getHref: () => "/admin/courses/new" },
      id: { getHref: (courseId: string) => `/admin/courses/${courseId}` },
    },
    "sim-management": {
      getHref: () => `/admin/sim-management`,
      section: {
        getHref: (sectionAssignmentId: string) =>
          `/admin/sim-management/${sectionAssignmentId}`,
      },
    },
  },

  user: {
    getHref: (userId: string) => `/user/profile/${userId}`,
  },

  simulation: {
    getHref: (caseId: string, sessionId: string) =>
      `/simulation/${caseId}/${sessionId}/chart/overview`,
    chart: {
      getHref: (caseId: string, sessionId: string, tab?: string) =>
        `/simulation/${caseId}/${sessionId}/chart${tab ? `/${tab}` : ""}`,
    },
  },
} as const;
