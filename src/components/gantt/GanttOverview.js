import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect, useState } from 'react';
import { usePatientStore } from '@/store/patientStore';
import { useUIStore } from '@/store/uiStore';
import { getPatientDays, getPhaseColor, getPhaseLabel, dateStr } from '@/lib/gantt-adapter';
import { sortByPhaseProgress } from '@/lib/sort';
import { PHASE_LABELS } from '@/types';
const phaseOrder = ['pre-op', 'surgery-day', 'post-op-icu', 'post-op-ward-monitor', 'post-op-ward', 'transfer', 'discharged'];
export function GanttOverview() {
    const { patients, updatePatient } = usePatientStore();
    const { openModal, addToast } = useUIStore();
    const containerRef = useRef(null);
    const [popup, setPopup] = useState(null);
    const activePatients = patients.filter((p) => !p.archived && p.admissionDate);
    const sorted = sortByPhaseProgress(activePatients);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dotSize = 10;
    const gap = 3;
    const cellSize = dotSize + gap * 2;
    const labelWidth = 140;
    const rowHeight = 28;
    const headerHeight = 22;
    let maxDays = 0;
    for (const p of sorted) {
        const days = getPatientDays(p, today);
        if (days.length > maxDays)
            maxDays = days.length;
    }
    if (maxDays < 7)
        maxDays = 7;
    useEffect(() => {
        if (!containerRef.current || sorted.length === 0)
            return;
        const el = containerRef.current;
        const todayX = labelWidth + (maxDays - 1) * cellSize;
        el.scrollLeft = Math.max(0, todayX - el.clientWidth / 2);
    }, [sorted.length, maxDays]);
    const handleDotClick = (e, patientId, date) => {
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        setPopup({ patientId, date: dateStr(date), x: rect.left, y: rect.bottom + 4 });
    };
    const handlePhaseChange = async (newPhase) => {
        if (!popup)
            return;
        const patient = patients.find(p => p.id === popup.patientId);
        if (!patient)
            return;
        const history = [...(patient.phaseHistory || [])];
        // Remove any existing entry for this date
        const filtered = history.filter(h => h.date !== popup.date);
        filtered.push({ phase: newPhase, date: popup.date });
        filtered.sort((a, b) => a.date.localeCompare(b.date));
        await updatePatient(popup.patientId, { phaseHistory: filtered });
        addToast(`${PHASE_LABELS[newPhase]} (${popup.date})`, 'success');
        setPopup(null);
    };
    if (sorted.length === 0) {
        return (_jsxs("div", { children: [_jsx("h2", { className: "font-ui text-lg font-bold text-[var(--color-text)] mb-3", children: "\u4F4F\u9662\u8FDB\u5EA6\u7518\u7279\u56FE" }), _jsx("div", { className: "text-center py-12 text-[var(--color-text-muted)]", children: "\u6682\u65E0\u4F4F\u9662\u60A3\u8005" })] }));
    }
    return (_jsxs("div", { children: [_jsx("h2", { className: "font-ui text-lg font-bold text-[var(--color-text)] mb-3", children: "\u4F4F\u9662\u8FDB\u5EA6\u7518\u7279\u56FE" }), _jsxs("div", { className: "border border-[var(--color-border)] rounded-[var(--radius)] bg-[var(--color-surface)] max-w-full", children: [_jsx("div", { ref: containerRef, className: "overflow-x-auto", style: { maxWidth: '100%' }, children: _jsx("div", { style: { display: 'inline-block', minWidth: '100%' }, children: _jsxs("div", { style: { position: 'relative' }, children: [_jsxs("div", { className: "flex border-b border-[var(--color-border)]", style: { height: headerHeight }, children: [_jsx("div", { className: "font-ui text-[10px] font-semibold text-[var(--color-text-secondary)] flex items-center px-2 border-r border-[var(--color-border)] sticky left-0 bg-[var(--color-surface)]", style: { width: labelWidth, zIndex: 2 }, children: "\u60A3\u8005 / \u5E8A\u53F7" }), _jsx("div", { className: "flex items-end", children: Array.from({ length: maxDays }, (_, i) => (_jsx("div", { className: "text-center", style: { width: cellSize }, children: _jsx("span", { className: "text-[8px] text-[var(--color-text-muted)] leading-tight block", children: (new Date(today.getTime() - (maxDays - 1 - i) * 86400000)).getDate() }) }, i))) })] }), sorted.map((patient) => {
                                        const days = getPatientDays(patient, today);
                                        return (_jsxs("div", { className: "flex border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] transition-colors", style: { height: rowHeight }, onClick: () => openModal('patientDetail', { patientId: patient.id }), children: [_jsxs("div", { className: "flex items-center px-2 border-r border-[var(--color-border)] sticky left-0 bg-[var(--color-surface)]", style: { width: labelWidth, zIndex: 1 }, children: [_jsx("span", { className: "text-[10px] font-semibold mr-1 whitespace-nowrap text-[var(--color-text)]", children: patient.name }), _jsx("span", { className: "text-[9px] text-[var(--color-text-muted)]", children: patient.bedNumber || '--' })] }), _jsx("div", { className: "flex items-center", children: Array.from({ length: maxDays }, (_, i) => {
                                                        const dayIdx = i - (maxDays - days.length);
                                                        if (dayIdx < 0)
                                                            return _jsx("div", { style: { width: cellSize } }, i);
                                                        const day = days[dayIdx];
                                                        const color = getPhaseColor(day.phase);
                                                        return (_jsx("div", { className: "flex items-center justify-center cursor-pointer", style: { width: cellSize }, title: `${day.date.toLocaleDateString('zh-CN')} — ${getPhaseLabel(day.phase)} (点击修改)`, onClick: (e) => handleDotClick(e, patient.id, day.date), children: _jsx("div", { style: {
                                                                    width: dotSize, height: dotSize, borderRadius: '50%', backgroundColor: color,
                                                                    border: day.isToday ? '1.5px solid #fff' : 'none',
                                                                    boxShadow: day.isToday ? '0 0 3px rgba(255,255,255,0.5)' : 'none',
                                                                } }) }, i));
                                                    }) })] }, patient.id));
                                    })] }) }) }), popup && (_jsxs("div", { className: "fixed z-50 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-[var(--radius)] shadow-lg p-2", style: { left: popup.x, top: popup.y }, children: [_jsxs("div", { className: "text-[10px] text-[var(--color-text-muted)] mb-1", children: [popup.date, " \u8BBE\u5B9A\u9636\u6BB5\uFF1A"] }), _jsx("div", { className: "flex flex-wrap gap-1 max-w-[200px]", children: phaseOrder.map((phase) => (_jsx("button", { className: "text-[10px] px-2 py-1 rounded-full text-white hover:opacity-80", style: { backgroundColor: getPhaseColor(phase) }, onClick: () => handlePhaseChange(phase), children: PHASE_LABELS[phase] }, phase))) }), _jsx("button", { className: "text-[10px] text-[var(--color-text-muted)] mt-1", onClick: () => setPopup(null), children: "\u53D6\u6D88" })] })), _jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 border-t border-[var(--color-border)]", children: [_jsx("span", { className: "text-[10px] text-[var(--color-text-muted)]", children: "\u56FE\u4F8B\uFF1A" }), phaseOrder.map((phase) => (_jsxs("span", { className: "flex items-center gap-0.5 text-[10px] text-[var(--color-text-secondary)]", children: [_jsx("span", { className: "inline-block w-2 h-2 rounded-full", style: { backgroundColor: getPhaseColor(phase) } }), PHASE_LABELS[phase]] }, phase)))] })] })] }));
}
