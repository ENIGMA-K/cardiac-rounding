import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { SESSION_LABELS, TUBE_LABELS } from '@/types';
import { usePatientStore } from '@/store/patientStore';
import { useRoundingStore } from '@/store/roundingStore';
import { useUIStore } from '@/store/uiStore';
import { db } from '@/lib/db';
import { getPatientDays, getPhaseColor } from '@/lib/gantt-adapter';
import { InfoSummary } from './InfoSummary';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { v4 as uid } from 'uuid';
export function RoundingView({ patientId, session, recordId }) {
    const [patient, setPatient] = useState(null);
    const [labResults, setLabResults] = useState([]);
    const [prevRecord, setPrevRecord] = useState(null);
    const [tagInput, setTagInput] = useState('');
    const [creating, setCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const { currentRecord, createRecord, loadRecord, setDetailsText, setLabText, setTodos } = useRoundingStore();
    const { getPatient, updatePatient } = usePatientStore();
    const { closeModal, addToast } = useUIStore();
    useEffect(() => {
        (async () => {
            const p = await getPatient(patientId);
            if (p)
                setPatient(p);
            const labs = await db.labResults.where('patientId').equals(patientId).reverse().sortBy('date');
            setLabResults(labs);
            const prevRecs = await db.roundingRecords.where('patientId').equals(patientId).reverse().sortBy('createdAt');
            if (prevRecs.length > 0)
                setPrevRecord(prevRecs[0]);
            setLoading(false);
        })();
    }, [patientId, getPatient]);
    useEffect(() => { if (recordId && patient)
        loadRecord(recordId); }, [recordId, patient, loadRecord]);
    useEffect(() => {
        if (patient && session && !creating && !currentRecord) {
            setCreating(true);
            createRecord(patient.id, patient.phase, session).then(() => setCreating(false))
                .catch((err) => { addToast('创建失败: ' + err.message, 'error'); setCreating(false); });
        }
    }, [patient, session, creating, currentRecord, createRecord, addToast]);
    const addTag = async (t) => {
        const newTag = (t || tagInput).trim();
        if (!patient || !newTag)
            return;
        if (patient.tags.includes(newTag)) {
            setTagInput('');
            return;
        }
        await updatePatient(patient.id, { tags: [...patient.tags, newTag] });
        setPatient({ ...patient, tags: [...patient.tags, newTag] });
        setTagInput('');
    };
    if (loading)
        return _jsx("div", { className: "p-6 text-center text-[var(--color-text-muted)]", children: "\u52A0\u8F7D\u4E2D..." });
    if (!patient)
        return _jsx("div", { className: "p-6 text-center text-[var(--color-error)]", children: "\u60A3\u8005\u672A\u627E\u5230" });
    if (!currentRecord)
        return _jsxs("div", { className: "p-6 text-center", children: [_jsx("div", { className: "text-[var(--color-text-muted)] mb-2", children: recordId ? '加载记录...' : '准备查房...' }), _jsx("div", { className: "w-8 h-8 mx-auto border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" })] });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeline = getPatientDays(patient, today);
    const activeTubes = (patient.tubes || []).filter(t => !t.removedAt);
    return (_jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)]", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsxs("h3", { className: "font-ui text-sm font-bold text-[var(--color-text)]", children: [patient.name, " \u00B7 ", SESSION_LABELS[currentRecord.session]] }), _jsx(Badge, { phase: patient.phase, variant: "subtle" })] }), _jsx("span", { className: `font-ui text-xs px-2 py-0.5 rounded-full ${currentRecord.status === 'completed' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'}`, children: currentRecord.status === 'completed' ? '已完成' : '进行中' })] }), _jsxs("div", { className: "p-4 space-y-3 max-h-[60vh] overflow-y-auto", children: [timeline.length > 0 && _jsx("div", { className: "flex items-center gap-0.5 overflow-x-auto py-1", children: timeline.map((c, i) => _jsx("div", { className: "flex-shrink-0", style: { width: 14 }, children: _jsx("div", { className: "w-3 h-3 rounded-sm", style: { backgroundColor: getPhaseColor(c.phase), border: c.isToday ? '2px solid #fff' : 'none' } }) }, i)) }), _jsxs(Card, { className: "p-2.5", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-ui text-xs text-[var(--color-text-muted)]", children: "\u6807\u7B7E\uFF1A" }), patient.tags.map(tag => _jsxs("span", { className: "font-ui inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]", children: [tag, _jsx("button", { onClick: () => updatePatient(patient.id, { tags: patient.tags.filter(x => x !== tag) }).then(() => setPatient({ ...patient, tags: patient.tags.filter(x => x !== tag) })), className: "hover:text-[var(--color-error)]", children: "\u00D7" })] }, tag)), _jsx("input", { value: tagInput, onChange: e => setTagInput(e.target.value), onKeyDown: e => e.key === 'Enter' && addTag(), placeholder: "\u6DFB\u52A0\u6807\u7B7E", className: "font-ui text-xs w-20 px-1.5 py-0.5 min-h-[24px]" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => addTag(), style: { minHeight: '24px', padding: '0 6px', fontSize: '11px' }, children: "+" })] }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1.5", children: ['CABG', 'AVR', 'MVR', 'Bentall', '夹层', '急诊', 'TAVI', 'LVAD', '房颤', '糖尿病', '高血压', 'CKD', 'COPD', '高龄', '抗凝', 'IABP', '休克', '先心病', '新生儿', '微创'].filter(t => !patient.tags.includes(t)).map(t => _jsx("button", { onClick: () => addTag(t), className: "text-[10px] px-1.5 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]", children: t }, t)) })] }), _jsx(InfoSummary, { patient: patient, labResults: labResults }), activeTubes.length > 0 && _jsxs(Card, { className: "p-3", children: [_jsx("h4", { className: "font-ui text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2", children: "\u7BA1\u8DEF" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: activeTubes.map(t => _jsxs("span", { className: "font-ui inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" }), TUBE_LABELS[t.type], _jsxs("span", { className: "text-[var(--color-text-muted)]", children: [Math.floor((Date.now() - new Date(t.insertedAt).getTime()) / 86400000), "d"] })] }, t.id)) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u5316\u9A8C" }), _jsx("textarea", { value: currentRecord.labText || '', onChange: e => setLabText(e.target.value), rows: 5, className: "w-full text-sm resize-none font-ui bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius)] p-3", placeholder: "Hb___  PLT___  WBC___\nK\u207A___  Na\u207A___  Ca\u00B2\u207A___\nScr___  Glc___  Lac___\nPT___  INR___  APTT___\npH___  PaO\u2082___  PaCO\u2082___" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u67E5\u623F" }), prevRecord && prevRecord.id !== currentRecord.id && prevRecord.detailsText && _jsxs("div", { className: "mb-2 p-2 rounded bg-[var(--color-bg)] text-xs text-[var(--color-text-muted)]", children: [_jsx("span", { className: "font-semibold", children: "\u4E0A\u6B21\uFF1A" }), prevRecord.detailsText.slice(0, 150), "..."] }), _jsx("textarea", { value: currentRecord.detailsText || '', onChange: e => setDetailsText(e.target.value), rows: 6, className: "w-full text-sm resize-none font-ui bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius)] p-3", placeholder: "\u67E5\u623F\u6240\u89C1\u3001\u75C5\u60C5\u53D8\u5316\u3001\u5904\u7406\u63AA\u65BD\u3001\u660E\u65E5\u8BA1\u5212\u2026" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u5F85\u529E" }), _jsxs("div", { className: "space-y-1.5", children: [(currentRecord.todos || []).map((todo) => _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: todo.done, onChange: () => { const tds = (currentRecord.todos || []).map(x => x.id === todo.id ? { ...x, done: !x.done } : x); setTodos(tds); }, className: "w-4 h-4" }), _jsx("input", { value: todo.text, onChange: e => { const tds = (currentRecord.todos || []).map(x => x.id === todo.id ? { ...x, text: e.target.value } : x); setTodos(tds); }, placeholder: "\u5F85\u529E\u4E8B\u9879...", className: `font-ui text-sm flex-1 ${todo.done ? 'line-through text-[var(--color-text-muted)]' : ''}` }), _jsx("button", { onClick: () => setTodos((currentRecord.todos || []).filter(x => x.id !== todo.id)), className: "text-[var(--color-text-muted)] hover:text-[var(--color-error)] text-xs", children: "\u00D7" })] }, todo.id)), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setTodos([...(currentRecord.todos || []), { id: uid(), text: '', done: false }]), children: "+ \u5F85\u529E" })] })] })] }), _jsxs("div", { className: "px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: async () => { await useRoundingStore.getState().saveDraft(); addToast('已保存', 'info'); }, children: "\u4FDD\u5B58" }), _jsx(Button, { size: "sm", onClick: async () => { await useRoundingStore.getState().saveRecord('completed'); addToast('查房已完成', 'success'); closeModal(); }, children: "\u5B8C\u6210\u67E5\u623F" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: closeModal, children: "\u5173\u95ED" })] })] }));
}
