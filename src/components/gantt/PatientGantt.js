import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { usePatientStore } from '@/store/patientStore';
import { patientToGanttTasks } from '@/lib/gantt-adapter';
import { PHASE_LABELS } from '@/types';
const phaseOrder = ['pre-op', 'surgery-day', 'post-op-icu', 'post-op-ward-monitor', 'post-op-ward', 'transfer'];
const phaseColors = {
    'pre-op': '#80868b', 'surgery-day': '#c5221f', 'post-op-icu': '#e37400',
    'post-op-ward-monitor': '#f9ab00', 'post-op-ward': '#1e8e3e', 'transfer': '#1a73e8', 'discharged': '#9aa0a6',
};
export function PatientGantt({ patientId }) {
    const [patient, setPatient] = useState(null);
    const { getPatient } = usePatientStore();
    const today = new Date();
    useEffect(() => { getPatient(patientId).then((p) => { if (p)
        setPatient(p); }); }, [patientId, getPatient]);
    if (!patient || !patient.admissionDate)
        return null;
    const tasks = patientToGanttTasks(patient, today);
    const admission = new Date(patient.admissionDate + 'T00:00:00');
    const totalDays = Math.max(3, Math.floor((today.getTime() - admission.getTime()) / 86400000) + 2);
    const barHeight = 24;
    const gap = 4;
    const totalHeight = tasks.length * (barHeight + gap) + 24;
    const labelWidth = 70;
    const svgWidth = 560;
    const barW = svgWidth - labelWidth;
    const dayPx = barW / totalDays;
    const getSvgX = (date) => labelWidth + ((date.getTime() - admission.getTime()) / 86400000) * dayPx;
    const tx = getSvgX(today);
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-ui text-sm font-semibold text-[var(--color-text)]", children: "\u4F4F\u9662\u8FDB\u5EA6\u7518\u7279\u56FE" }), _jsx("div", { className: "flex gap-2 text-[10px] text-[var(--color-text-muted)]", children: phaseOrder.map((p) => (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-sm", style: { backgroundColor: phaseColors[p] } }), PHASE_LABELS[p]] }, p))) })] }), _jsxs("svg", { width: svgWidth, height: totalHeight, className: "w-full border border-[var(--color-border)] rounded bg-[var(--color-surface)]", children: [_jsx("line", { x1: tx, y1: 0, x2: tx, y2: totalHeight, stroke: "var(--color-error)", strokeWidth: 1.5, strokeDasharray: "3,2" }), _jsx("text", { x: tx + 3, y: 10, fill: "var(--color-error)", fontSize: "9", fontFamily: "var(--font-ui)", children: "\u4ECA\u5929" }), tasks.map((task, i) => {
                        const y = i * (barHeight + gap) + 14;
                        const x = Math.max(labelWidth, getSvgX(task.startDate));
                        const w = Math.max(8, getSvgX(task.endDate) - x);
                        const isCurrent = patient.phase === task.phase && task.startDate <= today && task.endDate > today;
                        return (_jsxs("g", { children: [_jsx("text", { x: 2, y: y + 17, fill: "var(--color-text-secondary)", fontSize: "11", fontFamily: "var(--font-ui)", children: task.label }), _jsx("rect", { x: x, y: y, width: w, height: barHeight, rx: 3, fill: task.color, opacity: isCurrent ? 1 : 0.65 }), isCurrent && _jsx("rect", { x: x, y: y, width: w, height: barHeight, rx: 3, fill: "none", stroke: "var(--color-text)", strokeWidth: 1.5 })] }, i));
                    })] })] }));
}
