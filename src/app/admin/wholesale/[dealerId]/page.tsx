'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateRandomPassword } from '@/lib/password-generator';
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';

type Brand = { id: string; name: string };
type DealerUser = { id: string; name: string; email: string; phone: string | null; isActive: boolean };

const clampRangeInput = (value: string, min = 1, max = 99) => {
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return '';
  const numeric = Number(digits);
  if (!Number.isFinite(numeric)) return '';
  return String(Math.min(max, Math.max(min, numeric)));
};

export default function DealerDetailsPage() {
  const { dealerId } = useParams<{ dealerId: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [error, setError] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [users, setUsers] = useState<DealerUser[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [credentialsMailInfo, setCredentialsMailInfo] = useState<{ sent: boolean; error?: string } | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '' });
  const [formData, setFormData] = useState({
    companyName: '',
    contacts: '',
    requisites: '',
    status: 'active',
    brandIds: [] as string[],
  });
  const [brandDiscounts, setBrandDiscounts] = useState<Array<{ brandId: string; discountPercent: string }>>([]);
  const [brandDiscountTiers, setBrandDiscountTiers] = useState<Array<{ brandId: string; minQty: string; maxQty: string; discountPercent: string }>>([]);
  const [tierUiErrors, setTierUiErrors] = useState<{
    brandRows: number[];
    brandMessage: string;
  }>({ brandRows: [], brandMessage: '' });

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) {
      router.push('/admin/login');
      return;
    }
    setToken(t);
  }, [router]);

  const loadData = async () => {
    if (!token || !dealerId) return;
    setLoading(true);
    setError('');
    try {
      const [dealerRes, brandsRes] = await Promise.all([
        fetch(`/api/admin/wholesale/dealers/${dealerId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/brands', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const dealerData = await dealerRes.json();
      const brandsData = await brandsRes.json();

      if (!dealerRes.ok) throw new Error(dealerData.error || 'Не удалось загрузить дилера');

      setFormData({
        companyName: dealerData.dealer.companyName || '',
        contacts: dealerData.dealer.contacts || '',
        requisites: dealerData.dealer.requisites || '',
        status: dealerData.dealer.status || 'active',
        brandIds: (dealerData.dealer.brandAccesses || []).map((x: any) => x.brandId),
      });
      setUsers(dealerData.dealer.users || []);
      setBrands(brandsData.brands || []);
      setBrandDiscounts(
        (dealerData.dealer.brandAccesses || []).map((x: any) => ({
          brandId: x.brandId,
          discountPercent: String(Math.min(99, Math.max(1, Number(x.discountPercent ?? 1)))),
        }))
      );
      setBrandDiscountTiers(
        (dealerData.dealer.brandDiscountTiers || []).map((x: any) => ({
          brandId: x.brandId,
          minQty: String(Math.min(99, Math.max(1, Number(x.minQty ?? 1)))),
          maxQty: x.maxQty == null ? '' : String(Math.min(99, Math.max(1, Number(x.maxQty)))),
          discountPercent: String(Math.min(99, Math.max(1, Number(x.discountPercent ?? 1)))),
        }))
      );
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, dealerId]);

  const toggleBrand = (brandId: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.brandIds.includes(brandId);
      const nextBrandIds = alreadySelected
        ? prev.brandIds.filter((id) => id !== brandId)
        : [...prev.brandIds, brandId];

      setBrandDiscounts((current) => {
        if (alreadySelected) return current.filter((x) => x.brandId !== brandId);
        if (current.some((x) => x.brandId === brandId)) return current;
        return [...current, { brandId, discountPercent: '1' }];
      });

      return { ...prev, brandIds: nextBrandIds };
    });
  };

  const handleSaveDealer = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/wholesale/dealers/${dealerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          brandDiscounts: brandDiscounts.filter((x) => formData.brandIds.includes(x.brandId)),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Ошибка сохранения');
        return;
      }
      await loadData();
      alert('Дилер обновлён');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsCreatingUser(true);
    setCreatedCredentials(null);
    setCredentialsMailInfo(null);
    try {
      const res = await fetch(`/api/admin/wholesale/dealers/${dealerId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Ошибка создания');
        return;
      }
      setCreatedCredentials(data.credentials || null);
      setCredentialsMailInfo({ sent: !!data.emailSent, error: data.emailError });
      setNewUser({ name: '', email: '', password: '', phone: '' });
      await loadData();
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleToggleUser = async (userId: string, isActive: boolean) => {
    if (!token) return;
    await fetch(`/api/admin/wholesale/dealers/${dealerId}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await loadData();
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!token || !confirm(`Удалить пользователя ${email}?`)) return;
    await fetch(`/api/admin/wholesale/dealers/${dealerId}/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadData();
  };

  const validateTierRanges = (
    rows: Array<{ targetId: string; minQty: string; maxQty: string; discountPercent: string }>,
    targetLabel: string
  ): { message: string; rows: number[] } | null => {
    const grouped = new Map<string, Array<{ min: number; max: number; idx: number }>>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.targetId) continue;
      const min = Number(row.minQty);
      const max = row.maxQty === '' ? Infinity : Number(row.maxQty);
      const discount = Number(row.discountPercent);

      if (!Number.isFinite(min) || min < 1) {
        return { message: `${targetLabel}: в строке ${i + 1} поле "От" должно быть числом >= 1`, rows: [i] };
      }
      if (min > 99) {
        return { message: `${targetLabel}: в строке ${i + 1} поле "От" должно быть <= 99`, rows: [i] };
      }
      if (!(row.maxQty === '' || (Number.isFinite(max) && max >= min))) {
        return { message: `${targetLabel}: в строке ${i + 1} поле "До" должно быть пустым или >= "От"`, rows: [i] };
      }
      if (row.maxQty !== '' && max > 99) {
        return { message: `${targetLabel}: в строке ${i + 1} поле "До" должно быть <= 99`, rows: [i] };
      }
      if (!Number.isFinite(discount) || discount < 1 || discount > 99) {
        return { message: `${targetLabel}: в строке ${i + 1} скидка должна быть от 1 до 99`, rows: [i] };
      }

      const list = grouped.get(row.targetId) || [];
      list.push({ min, max, idx: i + 1 });
      grouped.set(row.targetId, list);
    }

    for (const [, ranges] of grouped) {
      const sorted = [...ranges].sort((a, b) => a.min - b.min);
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        if (curr.min <= prev.max) {
          return { message: `${targetLabel}: пересекаются диапазоны в строках ${prev.idx} и ${curr.idx}`, rows: [prev.idx - 1, curr.idx - 1] };
        }
      }
    }

    return null;
  };

  const saveDiscounts = async () => {
    if (!token) return;
    setTierUiErrors({ brandRows: [], brandMessage: '' });
    const brandTierValidation = validateTierRanges(
      brandDiscountTiers.map((x) => ({ targetId: x.brandId, minQty: x.minQty, maxQty: x.maxQty, discountPercent: x.discountPercent })),
      'Ступени по брендам'
    );
    if (brandTierValidation) {
      setError(brandTierValidation.message);
      setTierUiErrors((prev) => ({ ...prev, brandRows: brandTierValidation.rows, brandMessage: brandTierValidation.message }));
      return;
    }

    await fetch(`/api/admin/wholesale/dealers/${dealerId}/discounts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        productDiscounts: [],
        categoryDiscounts: [],
        categoryAccessIds: [],
        brandDiscountTiers: brandDiscountTiers
          .filter((x) => formData.brandIds.includes(x.brandId) && Number(x.minQty || 0) > 0)
          .map((x) => ({
            brandId: x.brandId,
            minQty: Number(clampRangeInput(x.minQty || '1')),
            maxQty: x.maxQty === '' ? null : Number(clampRangeInput(x.maxQty)),
            discountPercent: Number(clampRangeInput(x.discountPercent || '1')),
          })),
        categoryDiscountTiers: [],
      }),
    });
    setError('');
    setTierUiErrors({ brandRows: [], brandMessage: '' });
    await loadData();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/wholesale')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{formData.companyName || 'Дилер'}</h1>
        <Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
          {formData.status === 'active' ? 'Активен' : 'Заблокирован'}
        </Badge>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardHeader><CardTitle>Основная информация</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Название компании *</Label>
            <Input value={formData.companyName} onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))} />
          </div>
          <div>
            <Label>Контакты *</Label>
            <Textarea value={formData.contacts} onChange={(e) => setFormData((p) => ({ ...p, contacts: e.target.value }))} rows={4} />
          </div>
          <div>
            <Label>Реквизиты *</Label>
            <Textarea value={formData.requisites} onChange={(e) => setFormData((p) => ({ ...p, requisites: e.target.value }))} rows={4} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="dealer-active" checked={formData.status === 'active'} onCheckedChange={(checked) => setFormData((p) => ({ ...p, status: checked ? 'active' : 'blocked' }))} />
            <Label htmlFor="dealer-active" className="text-sm font-normal">Дилер активен</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Бренды и скидки</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox id={`brand-${brand.id}`} checked={formData.brandIds.includes(brand.id)} onCheckedChange={() => toggleBrand(brand.id)} />
                <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal cursor-pointer">{brand.name}</Label>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Базовая скидка по бренду (%)</Label>
            <p className="text-xs text-muted-foreground">
              Введите значение от 1 до 99. Это базовая скидка бренда, которая применяется, если нет более приоритетной ступени.
            </p>
            {formData.brandIds.length === 0 ? (
              <p className="text-sm text-muted-foreground">Сначала выберите хотя бы один бренд выше</p>
            ) : (
              <div className="space-y-2">
                {formData.brandIds.map((brandId) => {
                  const brand = brands.find((b) => b.id === brandId);
                  const current = brandDiscounts.find((x) => x.brandId === brandId)?.discountPercent ?? '0';
                  return (
                    <div key={brandId} className="grid gap-2 md:grid-cols-[1fr_180px]">
                      <div className="h-10 rounded-md border px-3 flex items-center bg-muted/20">
                        {brand?.name || 'Бренд'}
                      </div>
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        value={current}
                        onChange={(e) =>
                          setBrandDiscounts((prev) =>
                            prev.some((x) => x.brandId === brandId)
                              ? prev.map((x) => (x.brandId === brandId ? { ...x, discountPercent: clampRangeInput(e.target.value) } : x))
                              : [...prev, { brandId, discountPercent: clampRangeInput(e.target.value) || '1' }]
                          )
                        }
                        placeholder="Скидка %"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveDealer} disabled={isSaving} className="w-full">
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Пользователи дилера
            </CardTitle>
            <Button size="sm" onClick={() => { setShowAddUser(!showAddUser); setCreatedCredentials(null); }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddUser && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Имя *</Label>
                      <Input value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Пароль *</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input type={showPassword ? 'text' : 'password'} value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} required />
                          <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Button type="button" variant="outline" onClick={() => setNewUser((p) => ({ ...p, password: generateRandomPassword(12) }))}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Телефон</Label>
                      <Input value={newUser.phone} onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isCreatingUser}>{isCreatingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Создать пользователя</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>Отмена</Button>
                  </div>
                </form>
                {createdCredentials && (
                  <div className="mt-4 space-y-3">
                    {credentialsMailInfo?.sent && (
                      <p className="text-sm text-green-700 font-medium">
                        Учётные данные также отправлены на {createdCredentials.email}
                      </p>
                    )}
                    {credentialsMailInfo && !credentialsMailInfo.sent && (
                      <div className="p-3 rounded-md border border-amber-300 bg-amber-50 text-sm text-amber-900">
                        <strong>Письмо не отправлено.</strong>{' '}
                        {credentialsMailInfo.error ||
                          'Настройте SMTP «Коммуникация с партнёрами» в разделе Управление email.'}{' '}
                        Скопируйте данные ниже и передайте дилеру вручную.
                      </div>
                    )}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="font-medium text-green-800 mb-2">Данные для входа:</p>
                      <p className="text-sm">Email: <span className="font-mono">{createdCredentials.email}</span></p>
                      <div className="text-sm flex items-center gap-2">
                        <span>Пароль: <span className="font-mono">{createdCredentials.password}</span></span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigator.clipboard.writeText(createdCredentials.password)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">У дилера пока нет пользователей</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>{user.isActive ? 'Активен' : 'Заблокирован'}</Badge>
                    <Button variant="outline" size="sm" onClick={() => handleToggleUser(user.id, user.isActive)}>
                      {user.isActive ? 'Заблокировать' : 'Активировать'}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteUser(user.id, user.email)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Многоуровневые скидки временно скрыты по UX-решению */}
    </div>
  );
}

