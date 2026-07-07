import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { usePatientStore } from '@/store/patientStore';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/Card';
export function TodosPage() {
    const { patients, fetchPatients } = usePatientStore();
    const [todos, setTodos] = useState({ pending: [], done: [] });
    useEffect(() => { fetchPatients({ showArchived: true }).then(loadTodos); }, [fetchPatients]);
    const loadTodos = async () => {
        const active = usePatientStore.getState().patients.filter(p => !p.archived);
        const pending = [];
        const done = [];
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
    return (_jsxs("div", { children: [_jsx("h2", { className: "font-ui text-lg font-bold text-[var(--color-text)] mb-3", children: "\u5F85\u529E\u6C47\u603B" }), todos.pending.length === 0 && todos.done.length === 0 ? (_jsx("p", { className: "text-center py-12 text-[var(--color-text-muted)]", children: "\u6682\u65E0\u5F85\u529E" })) : (_jsxs("div", { className: "space-y-4", children: [todos.pending.length > 0 && _jsxs(Card, { className: "p-4", children: [_jsxs("h3", { className: "font-ui text-sm font-semibold text-[var(--color-warning)] mb-2", children: ["\u672A\u5B8C\u6210 (", todos.pending.length, ")"] }), todos.pending.map((t, i) => (_jsxs("div", { className: "flex items-center gap-2 text-sm py-0.5 cursor-pointer hover:bg-[var(--color-surface-hover)] rounded px-1", onClick: async () => {
                                    const recs = await db.roundingRecords.where('patientId').equals(t.patientId).toArray();
                                    for (const r of recs) {
                                        const updated = (r.todos || []).map(x => x.id === t.id ? { ...x, done: true } : x);
                                        await db.roundingRecords.update(r.id, { todos: updated });
                                    }
                                    loadTodos();
                                }, children: [_jsx("input", { type: "checkbox", className: "w-4 h-4 pointer-events-none" }), _jsx("span", { className: "flex-1", children: t.text || '(空)' }), _jsx("span", { className: "text-xs text-[var(--color-primary)]", children: t.patientName }), _jsx("span", { className: "text-xs text-[var(--color-text-muted)] w-8", children: t.bedNumber })] }, t.id)))] }), todos.done.length > 0 && _jsxs(Card, { className: "p-4", children: [_jsxs("h3", { className: "font-ui text-sm font-semibold text-[var(--color-text-muted)] mb-2", children: ["\u5DF2\u5B8C\u6210 (", todos.done.length, ")"] }), todos.done.map((t, i) => _jsxs("div", { className: "flex items-center gap-2 text-sm py-0.5 line-through text-[var(--color-text-muted)]", children: [_jsxs("span", { className: "w-5", children: [i + 1, "."] }), _jsx("span", { className: "flex-1", children: t.text || '(空)' }), _jsx("span", { className: "text-xs", children: t.patientName }), _jsx("span", { className: "text-xs w-8", children: t.bedNumber })] }, t.id))] })] }))] }));
}
