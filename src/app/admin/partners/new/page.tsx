'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
}

export default function NewPartnerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrandInput, setNewBrandInput] = useState('');
  const [newBrands, setNewBrands] = useState<string[]>([]);
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
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }

    fetch('/api/admin/brands', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.brands) setBrands(data.brands);
      })
      .catch(() => {});
  }, [router]);

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
    if (!trimmed) return;
    if (newBrands.includes(trimmed)) return;
    if (brands.some((b) => b.name.toLowerCase() === trimmed.toLowerCase())) return;
    setNewBrands((prev) => [...prev, trimmed]);
    setNewBrandInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ ...formData, newBrands }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/admin/partners/${data.partner.id}`);
      } else {
        alert(data.error || 'Ошибка при создании');
      }
    } catch {
      alert('Ошибка при создании партнёра');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/partners')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Создать партнёра</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Название партнёра *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
                placeholder="ООО «Пример»"
              />
            </div>
            <div>
              <Label htmlFor="contactPerson">ФИО ответственного лица *</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData((p) => ({ ...p, contactPerson: e.target.value }))}
                required
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData((p) => ({ ...p, contactEmail: e.target.value }))}
                  required
                  placeholder="partner@example.com"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Телефон</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData((p) => ({ ...p, contactPhone: e.target.value }))}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="requisites">Реквизиты компании</Label>
              <Textarea
                id="requisites"
                value={formData.requisites}
                onChange={(e) => setFormData((p) => ({ ...p, requisites: e.target.value }))}
                placeholder="ИНН, КПП, ОГРН, расчётный счёт, банк..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Адреса</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="officeAddress">Адрес офиса</Label>
              <Input
                id="officeAddress"
                value={formData.officeAddress}
                onChange={(e) => setFormData((p) => ({ ...p, officeAddress: e.target.value }))}
                placeholder="г. Москва, ул. Примерная, д. 1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="warehouseSameAsOffice"
                checked={formData.warehouseSameAsOffice}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({
                    ...p,
                    warehouseSameAsOffice: !!checked,
                    warehouseAddress: checked ? p.officeAddress : p.warehouseAddress,
                  }))
                }
              />
              <Label htmlFor="warehouseSameAsOffice" className="text-sm font-normal">
                Адрес склада совпадает с адресом офиса
              </Label>
            </div>
            {!formData.warehouseSameAsOffice && (
              <div>
                <Label htmlFor="warehouseAddress">Адрес склада</Label>
                <Input
                  id="warehouseAddress"
                  value={formData.warehouseAddress}
                  onChange={(e) => setFormData((p) => ({ ...p, warehouseAddress: e.target.value }))}
                  placeholder="г. Москва, ул. Складская, д. 5"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Доступные бренды</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Выберите бренды, по которым партнёр сможет загружать товары и видеть статистику
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={formData.brandIds.includes(brand.id)}
                    onCheckedChange={() => toggleBrand(brand.id)}
                  />
                  <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal cursor-pointer">
                    {brand.name}
                  </Label>
                </div>
              ))}
              {brands.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full">Брендов пока нет</p>
              )}
            </div>

            <div className="border-t pt-4">
              <Label>Добавить новый бренд</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newBrandInput}
                  onChange={(e) => setNewBrandInput(e.target.value)}
                  placeholder="Название нового бренда"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addNewBrand(); }
                  }}
                />
                <Button type="button" variant="outline" onClick={addNewBrand}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {newBrands.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newBrands.map((name) => (
                    <Badge key={name} variant="secondary" className="gap-1">
                      {name}
                      <button
                        type="button"
                        onClick={() => setNewBrands((prev) => prev.filter((n) => n !== name))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание...
              </>
            ) : (
              'Создать партнёра'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/partners')}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
