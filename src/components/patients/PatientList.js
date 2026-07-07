import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { usePatientStore } from '@/store/patientStore';
import { useUIStore } from '@/store/uiStore';
import { PatientCard } from './PatientCard';
import { StatsBar } from './StatsBar';
import { Button } from '@/components/ui/Button';
import { sortByBedNumber, computePhaseDays, getDoctorColor } from '@/lib/sort';
import { PHASE_LABELS } from '@/types';
const phaseOptions = ['', 'pre-op', 'surgery-day', 'post-op-icu', 'post-op-ward-monitor', 'post-op-ward', 'transfer', 'discharged'];
const phaseLabels = { '': '全部', 'pre-op': '术前', 'surgery-day': '手术日', 'post-op-icu': '术后监护', 'post-op-ward-monitor': '病房监护', 'post-op-ward': '术后病房', 'transfer': '转出', 'discharged': '已出院' };
export function PatientList() {
    const { patients, loading, fetchPatients } = usePatientStore();
    const { openModal } = useUIStore();
    const [filterPhase, setFilterPhase] = useState('');
    const [search, setSearch] = useState('');
    const [compact, setCompact] = useState(false);
    useEffect(() => { fetchPatients({ showArchived: true }); }, [fetchPatients]);
    const filtered = sortByBedNumber(patients.filter((p) => {
        if (filterPhase) {
            if (p.phase !== filterPhase)
                return false;
        }
        else {
            if (p.archived)
                return false;
        }
        if (search) {
            const q = search.toLowerCase();
            return p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q);
        }
        return true;
    }));
    // Doctor summary
    const doctorStats = useMemo(() => {
        const active = patients.filter(p => !p.archived);
        const map = new Map();
        for (const p of active) {
            if (!p.attendingDoctor)
                continue;
            const s = map.get(p.attendingDoctor) || { ward: 0, cicu: 0, other: 0 };
            const bed = (p.bedNumber || '').toUpperCase();
            if (bed.startsWith('CICU'))
                s.cicu++;
            else if (bed.startsWith('NICU'))
                s.other++;
            else
                s.ward++;
            map.set(p.attendingDoctor, s);
        }
        return [...map.entries()].sort((a, b) => b[1].ward + b[1].cicu + b[1].other - (a[1].ward + a[1].cicu + a[1].other));
    }, [patients]);
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h2", { className: "font-ui text-lg font-bold text-[var(--color-text)]", children: "\u60A3\u8005\u5217\u8868" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "\u641C\u7D22\u59D3\u540D/\u75C5\u5386\u53F7/\u8BCA\u65AD...", className: "font-ui text-sm px-3 py-1.5 w-48 rounded-md" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setCompact(!compact), children: compact ? '详细' : '紧密' }), _jsx(Button, { size: "sm", onClick: () => openModal('patientForm'), children: "+ \u65B0\u589E\u60A3\u8005" })] })] }), _jsx(StatsBar, {}), doctorStats.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-x-4 gap-y-0.5 mb-2 text-[11px]", children: doctorStats.map(([doc, s]) => (_jsxs("span", { className: "text-[var(--color-text-secondary)]", children: [_jsx("span", { className: "font-semibold text-[var(--color-text)]", children: doc }), _jsxs("span", { className: "text-[var(--color-text-muted)]", children: [" \u75C5\u623F", s.ward] }), s.cicu > 0 && _jsxs("span", { className: "text-[var(--color-text-muted)]", children: [" CICU", s.cicu] }), s.other > 0 && _jsxs("span", { className: "text-[var(--color-text-muted)]", children: [" \u5176\u4ED6", s.other] })] }, doc))) })), _jsx("div", { className: "flex flex-wrap gap-1.5 mb-3", children: phaseOptions.map((p) => (_jsx("button", { onClick: () => setFilterPhase(p), className: `font-ui text-xs px-2.5 py-1 rounded-full transition-colors ${filterPhase === p ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'}`, children: phaseLabels[p] }, p))) }), loading ? (_jsx("div", { className: "text-center py-12 text-[var(--color-text-muted)]", children: "\u52A0\u8F7D\u4E2D..." })) : filtered.length === 0 ? (_jsxs("div", { className: "text-center py-12 text-[var(--color-text-muted)]", children: [_jsx("p", { className: "text-lg mb-2", children: "\u6682\u65E0\u60A3\u8005" }), _jsx("p", { className: "text-sm", children: "\u70B9\u51FB\u53F3\u4E0A\u89D2\"\u65B0\u589E\u60A3\u8005\"\u6DFB\u52A0\u7B2C\u4E00\u4F4D\u60A3\u8005" })] })) : compact ? (_jsx("div", { className: "bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden", children: filtered.map((p, idx) => {
                    const { label, days } = computePhaseDays(p);
                    const phaseColor = `var(--phase-${p.phase})`;
                    return (_jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] cursor-pointer text-xs last:border-b-0", onClick: () => openModal('patientDetail', { patientId: p.id }), children: [_jsx("span", { className: "text-[var(--color-text-muted)] w-5 text-right flex-shrink-0", children: idx + 1 }), _jsx("span", { className: "font-data font-bold w-9 flex-shrink-0", style: { color: p.attendingDoctor ? getDoctorColor(p.attendingDoctor) : 'var(--color-primary)' }, children: p.bedNumber || '--' }), _jsx("span", { className: "font-semibold text-[var(--color-text)] w-14 flex-shrink-0 truncate", children: p.name }), _jsx("span", { className: "text-[var(--color-text-muted)] w-6 flex-shrink-0 text-center", children: p.gender === 'male' ? 'M' : 'F' }), _jsx("span", { className: "text-[var(--color-text-muted)] w-5 flex-shrink-0 text-right", children: p.age }), _jsxs("span", { className: "flex-shrink-0 px-1.5 py-0.5 rounded-full text-white text-[10px]", style: { backgroundColor: phaseColor }, children: [PHASE_LABELS[p.phase], days > 0 ? ` ${days}d` : ''] }), _jsx("span", { className: "text-[var(--color-text-secondary)] flex-1 truncate", children: p.diagnosis }), _jsx("span", { className: "flex gap-0.5 flex-shrink-0 max-w-[140px] overflow-hidden", children: p.tags.map(t => _jsx("span", { className: "text-[11px] px-1.5 rounded bg-[var(--color-primary)] text-white whitespace-nowrap", children: t }, t)) }), _jsx("span", { className: "text-[var(--color-text-muted)] w-14 flex-shrink-0 text-right", children: p.attendingDoctor || '--' })] }, p.id));
                }) })) : (_jsx("div", { children: filtered.map((p, idx) => (_jsxs("div", { className: "flex items-start gap-2 mb-2.5", children: [_jsx("span", { className: "text-xs text-[var(--color-text-muted)] w-5 text-right flex-shrink-0 mt-3", children: idx + 1 }), _jsx("div", { className: "flex-1", children: _jsx(PatientCard, { patient: p, onClick: () => openModal('patientDetail', { patientId: p.id }) }) })] }, p.id))) }))] }));
}
