export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  AUDITOR: "auditor"
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_ROUTES = {
  [ROLES.ADMIN]: "/",
  [ROLES.MANAGER]: "/dashboard/manager",
  [ROLES.AUDITOR]: "/dashboard/auditor"
} as const;
