import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { PHASE_LABELS, PHASE_TRANSITIONS, SESSION_LABELS, TUBE_LABELS } from '@/types';
import { usePatientStore } from '@/store/patientStore';
import { useUIStore } from '@/store/uiStore';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
export function PatientDetail({ patientId }) {
    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const { getPatient, archivePatient, transitionPhase, updatePatient } = usePatientStore();
    const { closeModal, openModal, addToast } = useUIStore();
    useEffect(() => {
        (async () => {
            const p = await getPatient(patientId);
            if (p)
                setPatient(p);
            const recs = await db.roundingRecords.where('patientId').equals(patientId).reverse().sortBy('createdAt');
            setRecords(recs);
        })();
    }, [patientId, getPatient]);
    if (!patient)
        return _jsx("div", { className: "p-4 text-center text-[var(--color-text-muted)]", children: "\u52A0\u8F7D\u4E2D..." });
    const handleArchive = async () => {
        if (confirm(`确认将 ${patient.name} 归档至已出院列表？`)) {
            await archivePatient(patient.id);
            addToast(`${patient.name} 已归档`, 'success');
            closeModal();
        }
    };
    const handleTransition = async (t) => {
        const label = PHASE_LABELS[t] || t;
        if (confirm(`确认将 ${patient.name} 转入「${label}」阶段？`)) {
            await transitionPhase(patient.id, t);
            addToast(`${patient.name} 已转入「${label}」`, 'success');
            const p = await getPatient(patient.id);
            if (p)
                setPatient(p);
        }
    };
    const handleRounding = (session) => { closeModal(); openModal('rounding', { patientId: patient.id, session }); };
    const handleTubeToggle = async (tubeId) => {
        if (!patient)
            return;
        const tube = patient.tubes.find(t => t.id === tubeId);
        if (!tube)
            return;
        if (tube.removedAt) {
            await updatePatient(patient.id, { tubes: patient.tubes.map(t => t.id === tubeId ? { ...t, removedAt: undefined } : t) });
        }
        else if (confirm(`确认拔除「${TUBE_LABELS[tube.type]}」？`)) {
            await updatePatient(patient.id, { tubes: patient.tubes.map(t => t.id === tubeId ? { ...t, removedAt: new Date().toISOString() } : t) });
        }
        const p = await getPatient(patient.id);
        if (p)
            setPatient(p);
    };
    const transitions = PHASE_TRANSITIONS[patient.phase] || [];
    return (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-ui text-base font-bold text-[var(--color-text)]", children: patient.name }), _jsx(Badge, { phase: patient.phase })] }), _jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "\u5E8A\u53F7\uFF1A" }), _jsx("span", { className: "font-data", children: patient.bedNumber || '--' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "\u75C5\u5386\u53F7\uFF1A" }), _jsx("span", { className: "font-data", children: patient.mrn || '--' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "\u6027\u522B\uFF1A" }), _jsx("span", { children: patient.gender === 'male' ? '男' : '女' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "\u5E74\u9F84\uFF1A" }), _jsxs("span", { className: "font-data", children: [patient.age, " \u5C81"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "\u5165\u9662\u65E5\u671F\uFF1A" }), _jsx("span", { children: patient.admissionDate })] }), patient.surgeryDate && _jsxs("div", { children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "\u624B\u672F\u65E5\u671F\uFF1A" }), _jsx("span", { children: patient.surgeryDate })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "\u4E3B\u7BA1\u533B\u751F\uFF1A" }), _jsx("span", { children: patient.attendingDoctor || '--' })] })] }), _jsxs("div", { className: "mt-2", children: [_jsx("span", { className: "text-[var(--color-text-muted)] text-sm", children: "\u8BCA\u65AD\uFF1A" }), _jsx("span", { className: "text-sm", children: patient.diagnosis || '--' })] }), patient.comorbidities.length > 0 && _jsxs("div", { className: "mt-1", children: [_jsx("span", { className: "text-[var(--color-text-muted)] text-sm", children: "\u5408\u5E76\u75C7\uFF1A" }), _jsx("span", { className: "text-sm", children: patient.comorbidities.join('、') })] }), patient.tags.length > 0 && _jsx("div", { className: "mt-2 flex flex-wrap gap-1", children: patient.tags.map(t => _jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white", children: t }, t)) })] }), patient.surgery && (_jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u624B\u672F\u4FE1\u606F" }), _jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "\u672F\u5F0F\uFF1A" }), _jsx("span", { children: patient.surgery.surgeryType })] }), patient.surgery.cpbTime != null && _jsxs("div", { children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "CPB\uFF1A" }), _jsxs("span", { className: "font-data", children: [patient.surgery.cpbTime, " min"] })] }), patient.surgery.crossClampTime != null && _jsxs("div", { children: [_jsx("span", { className: "text-[var(--color-text-muted)]", children: "\u963B\u65AD\uFF1A" }), _jsxs("span", { className: "font-data", children: [patient.surgery.crossClampTime, " min"] })] })] })] })), patient.tubes && patient.tubes.filter(t => !t.removedAt).length > 0 && (_jsxs(Card, { className: "p-4", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u7BA1\u8DEF\u72B6\u6001" }), _jsx("div", { className: "flex flex-wrap gap-2", children: patient.tubes.filter(t => !t.removedAt).map((tube) => {
                            const dsi = Math.floor((Date.now() - new Date(tube.insertedAt).getTime()) / 86400000);
                            return (_jsxs("span", { onClick: (e) => { e.stopPropagation(); handleTubeToggle(tube.id); }, className: "font-ui inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border cursor-pointer bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-error)] transition-colors", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-[var(--color-primary)]" }), TUBE_LABELS[tube.type], _jsxs("span", { className: "text-[var(--color-text-muted)]", children: [dsi, "d"] })] }, tube.id));
                        }) })] })), transitions.length > 0 && (_jsxs(Card, { className: "p-3", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: "\u9636\u6BB5\u8C03\u6574" }), _jsx("div", { className: "flex flex-wrap gap-2", children: transitions.map((t) => _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleTransition(t.target), children: t.label }, t.target)) })] })), records.length > 0 && (_jsxs(Card, { className: "p-4 border-l-2", style: { borderLeftColor: 'var(--color-primary)' }, children: [_jsxs("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: ["\u6700\u8FD1\u67E5\u623F (", records[0].createdAt.slice(0, 10), " ", SESSION_LABELS[records[0].session] || '', ")", _jsx("span", { className: `font-ui ml-2 text-xs px-1.5 py-0.5 rounded ${records[0].status === 'completed' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'}`, children: records[0].status === 'completed' ? '已完成' : '草稿' })] }), records[0].detailsText ? (_jsx("p", { className: "text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap", children: records[0].detailsText })) : (_jsx("p", { className: "text-xs text-[var(--color-text-muted)]", children: "\u65E0\u67E5\u623F\u8BB0\u5F55" })), _jsx("div", { className: "mt-2", children: _jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => { e.stopPropagation(); closeModal(); openModal('rounding', { patientId: patient.id, recordId: records[0].id }); }, children: "\u67E5\u770B/\u7F16\u8F91\u6B64\u8BB0\u5F55" }) })] })), _jsxs(Card, { className: "p-4", children: [_jsxs("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)] mb-2", children: ["\u5386\u6B21\u67E5\u623F\u8BB0\u5F55 ", records.length > 1 && _jsxs("span", { className: "font-normal text-xs text-[var(--color-text-muted)]", children: ["(\u5171", records.length, "\u6B21)"] })] }), records.length <= 1 ? (_jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: "\u6682\u65E0\u5386\u53F2\u8BB0\u5F55" })) : (_jsx("div", { className: "space-y-1 max-h-[260px] overflow-y-auto", children: records.slice(1).map((rec) => {
                            const date = rec.createdAt.slice(0, 10);
                            const time = rec.createdAt.slice(11, 16);
                            return (_jsxs("div", { className: "flex items-center justify-between py-1.5 px-2 rounded hover:bg-[var(--color-surface-hover)] text-sm cursor-pointer", onClick: (e) => { e.stopPropagation(); closeModal(); openModal('rounding', { patientId: patient.id, recordId: rec.id }); }, title: "\u70B9\u51FB\u67E5\u770B/\u7F16\u8F91", children: [_jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [_jsx("span", { className: `w-2 h-2 rounded-full flex-shrink-0 ${rec.status === 'completed' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}` }), _jsxs("span", { className: "text-[var(--color-text)] whitespace-nowrap", children: [date, " ", time] }), _jsxs("span", { className: "text-[var(--color-text-secondary)] truncate", children: ["\u00B7 ", PHASE_LABELS[rec.phase] || rec.phase, " \u00B7 ", SESSION_LABELS[rec.session] || rec.session] }), rec.detailsText && _jsxs("span", { className: "text-[var(--color-text-muted)] text-xs truncate hidden sm:inline", children: ["\u2014 ", rec.detailsText.slice(0, 30), "..."] })] }), _jsx("div", { className: "flex items-center gap-2 flex-shrink-0 ml-2", children: _jsx("span", { className: `text-xs px-1.5 py-0.5 rounded font-ui ${rec.status === 'completed' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'}`, children: rec.status === 'completed' ? '已完成' : '草稿' }) })] }, rec.id));
                        }) }))] }), _jsxs("div", { className: "flex justify-between", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => { closeModal(); openModal('patientForm', { patient }); }, children: "\u7F16\u8F91" }), !patient.archived && _jsx(Button, { variant: "danger", size: "sm", onClick: handleArchive, children: "\u5F52\u6863\u81F3\u51FA\u9662" })] }), _jsxs("div", { className: "flex gap-2", children: [!patient.archived && _jsx(Button, { size: "sm", onClick: () => handleRounding('am'), children: "\u5F00\u59CB\u65E9\u67E5\u623F" }), !patient.archived && _jsx(Button, { size: "sm", onClick: () => handleRounding('pm'), children: "\u5F00\u59CB\u665A\u67E5\u623F" })] })] })] }));
}
