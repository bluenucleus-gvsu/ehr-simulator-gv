

export function getUserRoute(userId:string | null, userRole:string | null): string {
    // Generates user home route for users based on role (student, admin, fauclty)
    
    if (!(userId && userRole))              return '/';
    if (userRole === 'student' && userId)   return `/user/profile/${userId}`;
    if (userRole === 'admin')               return '/admin';
    if (userRole === 'faculty' && userId)   return `/faculty/${userId}`;

    return '/'
}