'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Loader2, Plus, X, Users, Save,
  Eye, EyeOff, RefreshCw, Copy, Trash2, UserPlus,
} from 'lucide-react';
import { generateRandomPassword } from '@/lib/password-generator';

interface Brand { id: string; name: string; }
interface PartnerUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}
interface PartnerData {
  id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string | null;
  requisites: string | null;
  officeAddress: string | null;
  warehouseAddress: string | null;
  warehouseSameAsOffice: boolean;
  isActive: boolean;
  brands: { brand: Brand }[];
  users: PartnerUser[];
}

export default function PartnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState('');
  const [newBrands, setNewBrands] = useState<string[]>([]);

  // Partner user creation
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [credentialsMailInfo, setCredentialsMailInfo] = useState<{ sent: boolean; error?: string } | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    requisites: '',
    officeAddress: '',
    warehouseAddress: '',
    warehouseSameAsOffice: false,
    brandIds: [] as string[],
    isActive: true,
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const fetchPartner = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}`, { headers });
      const data = await res.json();
      if (data.success && data.partner) {
        setPartner(data.partner);
        const p = data.partner;
        setFormData({
          name: p.name,
          contactPerson: p.contactPerson,
          contactEmail: p.contactEmail,
          contactPhone: p.contactPhone || '',
          requisites: p.requisites || '',
          officeAddress: p.officeAddress || '',
          warehouseAddress: p.warehouseAddress || '',
          warehouseSameAsOffice: p.warehouseSameAsOffice,
          brandIds: p.brands.map((b: { brand: Brand }) => b.brand.id),
          isActive: p.isActive,
        });
      }
    } catch {
      alert('Ошибка загрузки партнёра');
    } finally {
      setIsLoading(false);
    }
  }, [partnerId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!token) { router.push('/admin/login'); return; }
    fetchPartner();
    fetch('/api/admin/brands', { headers })
      .then((r) => r.json())
      .then((data) => { if (data.brands) setBrands(data.brands); })
      .catch(() => {});
  }, [fetchPartner]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleBrand = (brandId: string) => {
    setFormData((prev) => ({
      ...prev,
      brandIds: prev.brandIds.includes(brandId)
        ? prev.brandIds.filter((id) => id !== brandId)
        : [...prev.brandIds, brandId],
    }));
  };

  const addNewBrand = () => {
    const trimmed = newBrandInput.trim();
    if (!trimmed || newBrands.includes(trimmed)) return;
    if (brands.some((b) => b.name.toLowerCase() === trimmed.toLowerCase())) return;
    setNewBrands((prev) => [...prev, trimmed]);
    setNewBrandInput('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ ...formData, newBrands }),
      });
      const data = await res.json();
      if (data.success) {
        setNewBrands([]);
        await fetchPartner();
        alert('Партнёр обновлён');
      } else {
        alert(data.error || 'Ошибка сохранения');
      }
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    setCreatedCredentials(null);
    setCredentialsMailInfo(null);
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (data.success) {
        setCreatedCredentials(data.credentials);
        setCredentialsMailInfo({ sent: !!data.emailSent, error: data.emailError });
        setNewUser({ name: '', email: '', password: '', phone: '' });
        await fetchPartner();
      } else {
        alert(data.error || 'Ошибка создания');
      }
    } catch {
      alert('Ошибка создания пользователя');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleToggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/partners/${partnerId}/users/${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isActive: !isActive }),
      });
      await fetchPartner();
    } catch {
      alert('Ошибка обновления');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Удалить пользователя ${email}?`)) return;
    try {
      await fetch(`/api/admin/partners/${partnerId}/users/${userId}`, {
        method: 'DELETE',
        headers,
      });
      await fetchPartner();
    } catch {
      alert('Ошибка удаления');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Партнёр не найден</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/partners')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{partner.name}</h1>
        <Badge variant={formData.isActive ? 'default' : 'secondary'}>
          {formData.isActive ? 'Активен' : 'Неактивен'}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Info card */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Название партнёра *</Label>
              <Input id="name" value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="contactPerson">ФИО ответственного лица *</Label>
              <Input id="contactPerson" value={formData.contactPerson}
                onChange={(e) => setFormData((p) => ({ ...p, contactPerson: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Email *</Label>
                <Input id="contactEmail" type="email" value={formData.contactEmail}
                  onChange={(e) => setFormData((p) => ({ ...p, contactEmail: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="contactPhone">Телефон</Label>
                <Input id="contactPhone" value={formData.contactPhone}
                  onChange={(e) => setFormData((p) => ({ ...p, contactPhone: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="requisites">Реквизиты компании</Label>
              <Textarea id="requisites" value={formData.requisites}
                onChange={(e) => setFormData((p) => ({ ...p, requisites: e.target.value }))} rows={4} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isActive" checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, isActive: !!checked }))} />
              <Label htmlFor="isActive" className="text-sm font-normal">Партнёр активен</Label>
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card>
          <CardHeader><CardTitle>Адреса</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="officeAddress">Адрес офиса</Label>
              <Input id="officeAddress" value={formData.officeAddress}
                onChange={(e) => setFormData((p) => ({ ...p, officeAddress: e.target.value }))} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="warehouseSame" checked={formData.warehouseSameAsOffice}
                onCheckedChange={(checked) => setFormData((p) => ({
                  ...p,
                  warehouseSameAsOffice: !!checked,
                  warehouseAddress: checked ? p.officeAddress : p.warehouseAddress,
                }))} />
              <Label htmlFor="warehouseSame" className="text-sm font-normal">
                Адрес склада совпадает с адресом офиса
              </Label>
            </div>
            {!formData.warehouseSameAsOffice && (
              <div>
                <Label htmlFor="warehouseAddress">Адрес склада</Label>
                <Input id="warehouseAddress" value={formData.warehouseAddress}
                  onChange={(e) => setFormData((p) => ({ ...p, warehouseAddress: e.target.value }))} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Brands */}
        <Card>
          <CardHeader><CardTitle>Доступные бренды</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox id={`brand-${brand.id}`} checked={formData.brandIds.includes(brand.id)}
                    onCheckedChange={() => toggleBrand(brand.id)} />
                  <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal cursor-pointer">
                    {brand.name}
                  </Label>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <Label>Добавить новый бренд</Label>
              <div className="flex gap-2 mt-1">
                <Input value={newBrandInput} onChange={(e) => setNewBrandInput(e.target.value)}
                  placeholder="Название нового бренда"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNewBrand(); } }} />
                <Button type="button" variant="outline" onClick={addNewBrand}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {newBrands.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newBrands.map((name) => (
                    <Badge key={name} variant="secondary" className="gap-1">
                      {name}
                      <button type="button" onClick={() => setNewBrands((prev) => prev.filter((n) => n !== name))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>

        {/* Partner Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Пользователи партнёра
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
                        <Input value={newUser.name}
                          onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} required />
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input type="email" value={newUser.email}
                          onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Пароль *</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input type={showPassword ? 'text' : 'password'} value={newUser.password}
                              onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} required />
                            <Button type="button" variant="ghost" size="sm"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <Button type="button" variant="outline"
                            onClick={() => setNewUser((p) => ({ ...p, password: generateRandomPassword(12) }))}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Телефон</Label>
                        <Input value={newUser.phone}
                          onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isCreatingUser}>
                        {isCreatingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Создать пользователя
                      </Button>
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
                          Скопируйте данные ниже и передайте партнёру вручную.
                        </div>
                      )}
                      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="font-medium text-green-800 mb-2">Данные для входа в кабинет:</p>
                        <div className="space-y-1 text-sm">
                          <p>
                            Email:{' '}
                            <span className="font-mono font-medium">{createdCredentials.email}</span>
                          </p>
                          <div className="flex items-center gap-2">
                            <p>
                              Пароль:{' '}
                              <span className="font-mono font-medium">{createdCredentials.password}</span>
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                navigator.clipboard.writeText(createdCredentials.password)
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {partner.users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                У партнёра пока нет пользователей
              </p>
            ) : (
              <div className="space-y-2">
                {partner.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Активен' : 'Заблокирован'}
                      </Badge>
                      <Button variant="outline" size="sm"
                        onClick={() => handleToggleUserActive(user.id, user.isActive)}>
                        {user.isActive ? 'Заблокировать' : 'Активировать'}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteUser(user.id, user.email)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
