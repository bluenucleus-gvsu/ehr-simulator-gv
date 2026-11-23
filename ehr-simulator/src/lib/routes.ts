export const routes = {
  home: {
    getHref: () => "/",
    // Route of each user group's home page
    forRole: (
      role: string | null | undefined,
      userId: string,
    ): string => {
      if (role === "admin") return routes.workspace.getHref();
      if (role === "faculty") return routes.workspace.getHref();
      if (role === "student" && userId) return routes.user.getHref(userId);
      return routes.auth.unprovisioned.getHref();
    },
  },

  auth: {
    root: "/auth", // prefix for middleware path matching (like caseBuilder.root — not a navigable route)
    e2e: { getHref: () => "/auth/e2e-login" },
    login: { getHref: () => "/auth/login" },
    callback: { getHref: () => "/auth/callback" },
    unprovisioned: { getHref: () => "/auth/unprovisioned" }
  },

  workspace: {
    getHref: () => "/workspace",
    cases: { getHref: () => "/workspace/cases" },
    barcodes: { getHref: () => "/workspace/barcodes" },
    caseBuilderMaintenance: { getHref: () => "/workspace/case-builder-maintenance" },
    settings: { getHref: () => "/workspace/settings" },
    caseBuilder: {
      root: "/workspace/case-builder", // intentionally a string for proxy.ts
      form: {
        getHref: (step: string, caseId?: string | null): string => {
          const path = `/workspace/case-builder/form/${step}`;
          if (!caseId) return path;
          return `${path}?caseId=${encodeURIComponent(caseId)}`;
        },
      },
    },
    courses: {
      getHref: () => "/workspace/courses",
      archived: { getHref: () => "/workspace/courses?view=archived" },
      new: { getHref: () => "/workspace/courses/new" },
      id: {
        getHref: (courseId: string) => `/workspace/courses/${courseId}`,
        assignCases: {
          getHref: (courseId: string) => `/workspace/courses/${courseId}/assign-cases`,
        },
      },
    },
    "sim-management": {
      getHref: () => `/workspace/sim-management`,
      section: {
        getHref: (sectionAssignmentId: string) =>
          `/workspace/sim-management/${sectionAssignmentId}`,
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
