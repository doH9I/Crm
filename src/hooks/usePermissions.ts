import { useAuthStore } from '../store';
import { UserRole } from '../types';

// Определение всех доступных разделов и действий
export const MODULES = {
  DASHBOARD: 'dashboard',
  PROJECTS: 'projects',
  ESTIMATES: 'estimates',
  MATERIALS: 'materials',
  TOOLS: 'tools',
  EMPLOYEES: 'employees',
  FINANCES: 'finances',
  CALENDAR: 'calendar',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  PROFILE: 'profile',
} as const;

export const ACTIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  APPROVE: 'approve',
  MANAGE: 'manage',
} as const;

// Права доступа по ролям
const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: ['*'], // Полный доступ
  [UserRole.MANAGER]: [
    MODULES.DASHBOARD,
    MODULES.PROJECTS,
    MODULES.ESTIMATES,
    MODULES.EMPLOYEES,
    MODULES.FINANCES,
    MODULES.CALENDAR,
    MODULES.REPORTS,
    MODULES.SETTINGS,
    MODULES.PROFILE,
  ],
  [UserRole.FOREMAN]: [
    MODULES.DASHBOARD,
    MODULES.PROJECTS,
    MODULES.MATERIALS,
    MODULES.TOOLS,
    MODULES.EMPLOYEES,
    MODULES.CALENDAR,
    MODULES.PROFILE,
  ],
  [UserRole.WORKER]: [
    MODULES.DASHBOARD,
    MODULES.PROJECTS,
    MODULES.CALENDAR,
    MODULES.PROFILE,
  ],
  [UserRole.ACCOUNTANT]: [
    MODULES.DASHBOARD,
    MODULES.ESTIMATES,
    MODULES.FINANCES,
    MODULES.REPORTS,
    MODULES.PROFILE,
  ],
  [UserRole.ARCHITECT]: [
    MODULES.DASHBOARD,
    MODULES.PROJECTS,
    MODULES.ESTIMATES,
    MODULES.PROFILE,
  ],
  [UserRole.ENGINEER]: [
    MODULES.DASHBOARD,
    MODULES.PROJECTS,
    MODULES.MATERIALS,
    MODULES.TOOLS,
    MODULES.PROFILE,
  ],
  [UserRole.SAFETY_OFFICER]: [
    MODULES.DASHBOARD,
    MODULES.PROJECTS,
    MODULES.EMPLOYEES,
    MODULES.REPORTS,
    MODULES.PROFILE,
  ],
  [UserRole.QUALITY_CONTROLLER]: [
    MODULES.DASHBOARD,
    MODULES.PROJECTS,
    MODULES.REPORTS,
    MODULES.PROFILE,
  ],
  [UserRole.PROCUREMENT_MANAGER]: [
    MODULES.DASHBOARD,
    MODULES.MATERIALS,
    MODULES.TOOLS,
    MODULES.ESTIMATES,
    MODULES.FINANCES,
    MODULES.PROFILE,
  ],
  [UserRole.LOGISTICS_COORDINATOR]: [
    MODULES.DASHBOARD,
    MODULES.MATERIALS,
    MODULES.TOOLS,
    MODULES.PROJECTS,
    MODULES.PROFILE,
  ],
};

export const usePermissions = () => {
  const { user } = useAuthStore();

  const hasPermission = (module: string, action: string = ACTIONS.READ): boolean => {
    if (!user) return false;

    // Администратор имеет полный доступ
    if (user.role === UserRole.ADMIN) return true;

    // Проверяем пользовательские разрешения
    if (user.permissions) {
      // Если есть глобальное разрешение "*"
      if (user.permissions.includes('*')) return true;
      
      // Если есть разрешение на конкретный модуль
      if (user.permissions.includes(module)) return true;
    }

    // Проверяем разрешения по роли
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes('*') || rolePermissions.includes(module);
  };

  const canAccess = (module: string): boolean => {
    return hasPermission(module, ACTIONS.READ);
  };

  const canWrite = (module: string): boolean => {
    return hasPermission(module, ACTIONS.WRITE);
  };

  const canDelete = (module: string): boolean => {
    return hasPermission(module, ACTIONS.DELETE);
  };

  const canApprove = (module: string): boolean => {
    return hasPermission(module, ACTIONS.APPROVE);
  };

  const canManage = (module: string): boolean => {
    return hasPermission(module, ACTIONS.MANAGE);
  };

  const isAdmin = (): boolean => {
    return user?.role === UserRole.ADMIN;
  };

  const getAccessibleModules = (): string[] => {
    if (!user) return [];

    if (user.role === UserRole.ADMIN) {
      return Object.values(MODULES);
    }

    const modules = new Set<string>();

    // Добавляем модули из пользовательских разрешений
    if (user.permissions) {
      if (user.permissions.includes('*')) {
        return Object.values(MODULES);
      }
      user.permissions.forEach(permission => modules.add(permission));
    }

    // Добавляем модули из ролевых разрешений
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    rolePermissions.forEach(permission => {
      if (permission === '*') {
        Object.values(MODULES).forEach(module => modules.add(module));
      } else {
        modules.add(permission);
      }
    });

    return Array.from(modules);
  };

  return {
    hasPermission,
    canAccess,
    canWrite,
    canDelete,
    canApprove,
    canManage,
    isAdmin,
    getAccessibleModules,
    user,
  };
};

export default usePermissions;