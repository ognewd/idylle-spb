interface AdminUser {
  role: string;
  allowedAdminSections?: string[];
  partnerId?: string | null;
}

export const ADMIN_SECTIONS = {
  products: 'products',
  categories: 'categories',
  'seasonal-discounts': 'seasonal-discounts',
  filters: 'filters',
  users: 'users',
  orders: 'orders',
  administrators: 'administrators',
  partners: 'partners',
} as const;

const PARTNER_SECTIONS = ['products', 'partner-statistics'] as const;

export function hasAccessToSection(
  admin: AdminUser,
  section: keyof typeof ADMIN_SECTIONS | string
): boolean {
  if (admin.role === 'super_admin') {
    return true;
  }

  if (admin.role === 'partner') {
    return (PARTNER_SECTIONS as readonly string[]).includes(section);
  }

  if (admin.role !== 'admin') {
    return false;
  }

  if (!admin.allowedAdminSections || admin.allowedAdminSections.length === 0) {
    return false;
  }

  return admin.allowedAdminSections.includes(section);
}

export function hasAnyAccess(admin: AdminUser): boolean {
  if (admin.role === 'super_admin') {
    return true;
  }

  if (admin.role === 'partner') {
    return true;
  }

  if (admin.role !== 'admin') {
    return false;
  }

  return !!(admin.allowedAdminSections && admin.allowedAdminSections.length > 0);
}

export function getAvailableSections(admin: AdminUser): string[] {
  if (admin.role === 'super_admin') {
    return Object.values(ADMIN_SECTIONS);
  }

  if (admin.role === 'partner') {
    return [...PARTNER_SECTIONS];
  }

  return admin.allowedAdminSections || [];
}
