export function homeRouteForRole(
  role: string | null,
  userId: string
): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'faculty':
      return `/faculty/${userId}`
    case 'student':
      return `/user/profile/${userId}`
    default:
      return '/auth/unprovisioned'
  }
}
