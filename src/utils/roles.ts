// utils/roles.ts - UPDATED VERSION
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager", 
  AUDITOR: "auditor",
  SUPERVISOR: "supervisor",
  NOZZLEMAN: "nozzleman"
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_ROUTES = {
  [ROLES.ADMIN]: "/",
  [ROLES.MANAGER]: "/dashboard/manager",
  [ROLES.AUDITOR]: "/dashboard/auditor",
  [ROLES.SUPERVISOR]: "/dashboard/supervisor", 
  [ROLES.NOZZLEMAN]: "/dashboard/nozzleman"
} as const;

// Helper functions for role checks
export const isNozzleman = (role: Role | undefined): boolean => {
  return role === ROLES.NOZZLEMAN;
};

export const canManageNozzlemen = (role: Role | undefined): boolean => {
  if (!role) return false;
  return role === ROLES.ADMIN || role === ROLES.SUPERVISOR || role === ROLES.MANAGER;
};

export const hasPermission = (userRole: Role | undefined, requiredRoles: Role[]): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};

// Role hierarchy for permissions
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.AUDITOR, ROLES.NOZZLEMAN],
  [ROLES.MANAGER]: [ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.AUDITOR, ROLES.NOZZLEMAN],
  [ROLES.SUPERVISOR]: [ROLES.SUPERVISOR, ROLES.NOZZLEMAN],
  [ROLES.AUDITOR]: [ROLES.AUDITOR],
  [ROLES.NOZZLEMAN]: [ROLES.NOZZLEMAN],
};