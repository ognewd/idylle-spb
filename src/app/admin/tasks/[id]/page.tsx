'use client';

import { useParams } from 'next/navigation';
import { TaskDetailPanel } from '@/components/admin/TaskDetailPanel';

export default function AdminTaskDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  if (!id) {
    return null;
  }
  return <TaskDetailPanel taskId={id} mode="page" />;
}
