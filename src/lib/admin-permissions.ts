// Utility functions for checking admin permissions

interface AdminUser {
  role: string;
  allowedAdminSections?: string[];
}

// Маппинг разделов админки
export const ADMIN_SECTIONS = {
  products: 'products',
  categories: 'categories',
  'seasonal-discounts': 'seasonal-discounts',
  filters: 'filters',
  users: 'users',
  orders: 'orders',
  administrators: 'administrators',
} as const;

/**
 * Проверяет, имеет ли администратор доступ к определенному разделу
 */
export function hasAccessToSection(
  admin: AdminUser,
  section: keyof typeof ADMIN_SECTIONS
): boolean {
  // Супер-админы имеют доступ ко всему
  if (admin.role === 'super_admin') {
    return true;
  }

  // Если роль не админ, нет доступа
  if (admin.role !== 'admin') {
    return false;
  }

  // Если у админа нет явных прав, нет доступа
  if (!admin.allowedAdminSections || admin.allowedAdminSections.length === 0) {
    return false;
  }

  // Проверяем, есть ли нужный раздел в списке разрешенных
  return admin.allowedAdminSections.includes(section);
}

/**
 * Проверяет, имеет ли администратор доступ хотя бы к одному разделу
 */
export function hasAnyAccess(admin: AdminUser): boolean {
  if (admin.role === 'super_admin') {
    return true;
  }

  if (admin.role !== 'admin') {
    return false;
  }

  return !!(admin.allowedAdminSections && admin.allowedAdminSections.length > 0);
}

/**
 * Получает список доступных разделов для администратора
 */
export function getAvailableSections(admin: AdminUser): string[] {
  if (admin.role === 'super_admin') {
    return Object.values(ADMIN_SECTIONS);
  }

  return admin.allowedAdminSections || [];
}
