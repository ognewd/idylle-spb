export type PanelRole = 'admin' | 'super_admin' | 'partner' | 'dealer' | 'user';
export type PanelMode = 'admin' | 'partner' | 'dealer';

export function normalizeRoles(role: string | null | undefined, roles: string[] | null | undefined): PanelRole[] {
  const merged = new Set<string>();
  if (Array.isArray(roles)) {
    for (const r of roles) {
      if (r && typeof r === 'string') merged.add(r);
    }
  }
  if (role && typeof role === 'string') {
    merged.add(role);
  }
  if (merged.size === 0) merged.add('user');
  return Array.from(merged) as PanelRole[];
}

export function getAvailablePanelModes(userRoles: PanelRole[]): PanelMode[] {
  const modes: PanelMode[] = [];
  if (userRoles.includes('admin') || userRoles.includes('super_admin')) modes.push('admin');
  if (userRoles.includes('partner')) modes.push('partner');
  if (userRoles.includes('dealer')) modes.push('dealer');
  return modes;
}

export function resolveDefaultPanelMode(userRoles: PanelRole[]): PanelMode | null {
  const modes = getAvailablePanelModes(userRoles);
  if (modes.length === 0) return null;
  if (modes.includes('admin')) return 'admin';
  if (modes.includes('partner')) return 'partner';
  return modes[0] || null;
}

