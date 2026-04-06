'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type DealerRequest = {
  id: string;
  companyName: string;
  contacts: string;
  requisites: string;
  brands: string;
  status: 'new' | 'in_review' | 'approved' | 'rejected';
  managerNote?: string | null;
  createdAt: string;
};

type DealerRow = {
  id: string;
  companyName: string;
  status: string;
  users: Array<{ id: string; email: string; name: string | null; isActive: boolean }>;
  brandAccesses: Array<{ brandId: string; discountPercent: number; brand: { name: string } }>;
};

const REQUEST_STATUS_OPTIONS: DealerRequest['status'][] = ['new', 'in_review', 'approved', 'rejected'];
const REQUEST_STATUS_LABELS: Record<DealerRequest['status'], string> = {
  new: 'Новая',
  in_review: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
};

export default function WholesaleAdminPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<DealerRequest[]>([]);
  const [dealers, setDealers] = useState<DealerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createState, setCreateState] = useState({
    requestId: '',
    companyName: '',
    contacts: '',
    requisites: '',
  });
  const [creating, setCreating] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const loadData = async () => {
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [reqRes, dealersRes] = await Promise.all([
        fetch('/api/admin/wholesale/requests', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/wholesale/dealers', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const reqData = await reqRes.json();
      const dealersData = await dealersRes.json();
      if (!reqRes.ok) throw new Error(reqData.error || 'Не удалось загрузить заявки');
      if (!dealersRes.ok) throw new Error(dealersData.error || 'Не удалось загрузить дилеров');
      setRequests(reqData.requests || []);
      setDealers(dealersData.dealers || []);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'new' || r.status === 'in_review'),
    [requests]
  );
  const selectedRequest = useMemo(
    () => pendingRequests.find((r) => r.id === createState.requestId) || null,
    [pendingRequests, createState.requestId]
  );
  const canCreateDealer =
    !!createState.companyName.trim() &&
    !!createState.contacts.trim() &&
    !!createState.requisites.trim();

  const updateRequestStatus = async (id: string, status: DealerRequest['status']) => {
    if (!token) return;
    await fetch(`/api/admin/wholesale/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    await loadData();
  };

  const prefillFromRequest = (req: DealerRequest) => {
    setCreateState((prev) => ({
      ...prev,
      requestId: req.id,
      companyName: req.companyName,
      contacts: req.contacts,
      requisites: req.requisites,
    }));
  };

  const createDealer = async () => {
    if (!token) return;
    if (!canCreateDealer) {
      setError('Заполните все поля перед созданием дилера');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/admin/wholesale/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(createState),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось создать дилера');
      setCreateState({
        requestId: '',
        companyName: '',
        contacts: '',
        requisites: '',
      });
      await loadData();
    } catch (e: any) {
      setError(e?.message || 'Ошибка создания дилера');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Опт: дилеры и заявки</h1>
          <p className="text-sm text-gray-600">Единый раздел для обработки заявок, создания дилеров и настройки доступа.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Входящие заявки</CardTitle>
              <CardDescription>Заявки со страницы «Сотрудничество / Дилерам»</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-gray-600">Загрузка...</p>
              ) : requests.length === 0 ? (
                <p className="text-sm text-gray-600">Заявок пока нет</p>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{req.companyName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(req.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <Select value={req.status} onValueChange={(v) => updateRequestStatus(req.id, v as DealerRequest['status'])}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue>{REQUEST_STATUS_LABELS[req.status]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {REQUEST_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {REQUEST_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">{req.contacts}</p>
                    <p className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">{req.brands}</p>
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={() => prefillFromRequest(req)}>
                        Создать дилера из заявки
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Создание дилера</CardTitle>
              <CardDescription>Создание аккаунта дилера вручную или из заявки</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Заявка (опционально)</Label>
                <Select
                  value={createState.requestId || 'none'}
                  onValueChange={(v) => {
                    const requestId = v === 'none' ? '' : v;
                    const req = pendingRequests.find((r) => r.id === requestId);
                    setCreateState((prev) => ({
                      ...prev,
                      requestId,
                      companyName: req?.companyName ?? '',
                      contacts: req?.contacts ?? '',
                      requisites: req?.requisites ?? '',
                    }));
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите заявку" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без заявки</SelectItem>
                    {pendingRequests.map((req) => (
                      <SelectItem key={req.id} value={req.id}>
                        {req.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRequest && (
                  <p className="mt-1 text-xs text-gray-500">
                    Данные компании/контактов/реквизитов подтянуты из заявки.
                  </p>
                )}
              </div>
              <div>
                <Label>Компания</Label>
                <Input value={createState.companyName} onChange={(e) => setCreateState((p) => ({ ...p, companyName: e.target.value }))} />
              </div>
              <div>
                <Label>Контакты</Label>
                <Textarea className="min-h-[90px]" value={createState.contacts} onChange={(e) => setCreateState((p) => ({ ...p, contacts: e.target.value }))} />
              </div>
              <div>
                <Label>Реквизиты</Label>
                <Textarea className="min-h-[90px]" value={createState.requisites} onChange={(e) => setCreateState((p) => ({ ...p, requisites: e.target.value }))} />
              </div>
              <Button onClick={createDealer} disabled={creating || !canCreateDealer}>
                {creating ? 'Создаем...' : 'Создать дилера'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Дилеры</CardTitle>
            <CardDescription>Управление доступом к брендам и индивидуальными скидками</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-600">Загрузка...</p>
            ) : dealers.length === 0 ? (
              <p className="text-sm text-gray-600">Дилеров пока нет</p>
            ) : (
              dealers.map((dealer) => (
                <div key={dealer.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{dealer.companyName}</p>
                    <p className="text-xs text-gray-600">
                      Пользователей: {dealer.users.length}
                    </p>
                    <p className="text-xs text-gray-600">
                      Брендов в доступе: {dealer.brandAccesses.length}
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/admin/wholesale/${dealer.id}`}>Настроить доступы и скидки</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

