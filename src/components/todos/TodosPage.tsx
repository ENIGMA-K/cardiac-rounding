import { useEffect, useState } from 'react';
import { usePatientStore } from '@/store/patientStore';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/Card';

interface TodoEntry { id: string; text: string; done: boolean; patientId: string; patientName: string; bedNumber: string; }

export function TodosPage() {
  const { patients, fetchPatients } = usePatientStore();
  const [todos, setTodos] = useState<{ pending: TodoEntry[]; done: TodoEntry[] }>({ pending: [], done: [] });

  useEffect(() => { fetchPatients({ showArchived: true }).then(loadTodos); }, [fetchPatients]);

  const loadTodos = async () => {
    const active = usePatientStore.getState().patients.filter(p => !p.archived);
    const pending: TodoEntry[] = []; const done: TodoEntry[] = [];
    for (const p of active) {
      const recs = await db.roundingRecords.where('patientId').equals(p.id).reverse().sortBy('createdAt');
      for (const r of recs) {
        for (const t of (r.todos || [])) {
          (t.done ? done : pending).push({ ...t, patientId: p.id, patientName: p.name, bedNumber: p.bedNumber });
        }
      }
    }
    setTodos({ pending, done });
  };

  return (
    <div>
      <h2 className="font-ui text-lg font-bold text-[var(--color-text)] mb-3">待办汇总</h2>
      {todos.pending.length === 0 && todos.done.length === 0 ? (
        <p className="text-center py-12 text-[var(--color-text-muted)]">暂无待办</p>
      ) : (
        <div className="space-y-4">
          {todos.pending.length > 0 && <Card className="p-4">
            <h3 className="font-ui text-sm font-semibold text-[var(--color-warning)] mb-2">未完成 ({todos.pending.length})</h3>
            {todos.pending.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2 text-sm py-0.5 cursor-pointer hover:bg-[var(--color-surface-hover)] rounded px-1" onClick={async () => {
                const recs = await db.roundingRecords.where('patientId').equals(t.patientId).toArray();
                for (const r of recs) {
                  const updated = (r.todos||[]).map(x => x.id===t.id ? {...x, done:true} : x);
                  await db.roundingRecords.update(r.id, { todos: updated });
                }
                loadTodos();
              }}>
                <input type="checkbox" className="w-4 h-4 pointer-events-none" />
                <span className="flex-1">{t.text || '(空)'}</span>
                <span className="text-xs text-[var(--color-primary)]">{t.patientName}</span>
                <span className="text-xs text-[var(--color-text-muted)] w-8">{t.bedNumber}</span>
              </div>))}
          </Card>}
          {todos.done.length > 0 && <Card className="p-4">
            <h3 className="font-ui text-sm font-semibold text-[var(--color-text-muted)] mb-2">已完成 ({todos.done.length})</h3>
            {todos.done.map((t, i) => <div key={t.id} className="flex items-center gap-2 text-sm py-0.5 line-through text-[var(--color-text-muted)]">
              <span className="w-5">{i+1}.</span><span className="flex-1">{t.text || '(空)'}</span>
              <span className="text-xs">{t.patientName}</span><span className="text-xs w-8">{t.bedNumber}</span>
            </div>)}
          </Card>}
        </div>
      )}
    </div>
  );
}
