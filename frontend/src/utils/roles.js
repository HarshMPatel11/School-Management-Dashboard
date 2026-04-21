export const ROLE_HOME_PATH = {
  admin: "/dashboard",
  employee: "/dashboard",
  student: "/student/dashboard",
};

export const getDefaultRouteForRole = (role) => ROLE_HOME_PATH[role] || "/login";

export const hasRequiredRole = (role, roles = []) => {
  if (!roles.length) {
    return true;
  }

  return roles.includes(role);
};
