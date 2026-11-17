export const routes = {
  home: {
    getHref: () => "/",
    // Route of each user group's home page
    forRole: (
      role: string | null | undefined,
      userId: string,
      fallback: string
    ): string => {
      if (role === "admin") return routes.admin.getHref();
      if (role === "faculty" && userId) return routes.faculty.getHref(userId);
      if (role === "student" && userId) return routes.user.getHref(userId);
      return fallback;
    },
  },

  auth: {
    e2e: { getHref: () => "/auth/e2e-login" },
    login: { getHref: () => "/auth/login" },
    callback: { getHref: () => "/auth/callback" },
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
  },

  faculty: {
    getHref: (userId: string) => `/faculty/${userId}`,
    section: {
      getHref: (userId: string, sectionAssignmentId: string) =>
        `/faculty/${userId}/${sectionAssignmentId}`,
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
