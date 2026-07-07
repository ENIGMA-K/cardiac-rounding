import { useEffect, useState, useMemo } from 'react';
import { usePatientStore } from '@/store/patientStore';
import { useUIStore } from '@/store/uiStore';
import { PatientCard } from './PatientCard';
import { StatsBar } from './StatsBar';
import { Button } from '@/components/ui/Button';
import { sortByBedNumber, computePhaseDays, getDoctorColor } from '@/lib/sort';
import { PHASE_LABELS } from '@/types';
import type { ClinicalPhase } from '@/types';

const phaseOptions: (ClinicalPhase | '')[] = ['', 'pre-op', 'surgery-day', 'post-op-icu', 'post-op-ward-monitor', 'post-op-ward', 'transfer', 'discharged'];
const phaseLabels: Record<string, string> = { '': '全部', 'pre-op': '术前', 'surgery-day': '手术日', 'post-op-icu': '术后监护', 'post-op-ward-monitor': '病房监护', 'post-op-ward': '术后病房', 'transfer': '转出', 'discharged': '已出院' };

export function PatientList() {
  const { patients, loading, fetchPatients } = usePatientStore();
  const { openModal } = useUIStore();
  const [filterPhase, setFilterPhase] = useState<ClinicalPhase | ''>('');
  const [search, setSearch] = useState('');
  const [compact, setCompact] = useState(false);

  useEffect(() => { fetchPatients({ showArchived: true }); }, [fetchPatients]);

  const filtered = sortByBedNumber(patients.filter((p) => {
    if (filterPhase) { if (p.phase !== filterPhase) return false; }
    else { if (p.archived) return false; }
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q);
    }
    return true;
  }));

  // Doctor summary
  const doctorStats = useMemo(() => {
    const active = patients.filter(p => !p.archived);
    const map = new Map<string, { ward: number; cicu: number; other: number }>();
    for (const p of active) {
      if (!p.attendingDoctor) continue;
      const s = map.get(p.attendingDoctor) || { ward: 0, cicu: 0, other: 0 };
      const bed = (p.bedNumber || '').toUpperCase();
      if (bed.startsWith('CICU')) s.cicu++;
      else if (bed.startsWith('NICU')) s.other++;
      else s.ward++;
      map.set(p.attendingDoctor, s);
    }
    return [...map.entries()].sort((a, b) => b[1].ward + b[1].cicu + b[1].other - (a[1].ward + a[1].cicu + a[1].other));
  }, [patients]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-ui text-lg font-bold text-[var(--color-text)]">患者列表</h2>
        <div className="flex items-center gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索姓名/病历号/诊断..." className="font-ui text-sm px-3 py-1.5 w-48 rounded-md" />
          <Button size="sm" variant="ghost" onClick={() => setCompact(!compact)}>{compact ? '详细' : '紧密'}</Button>
          <Button size="sm" onClick={() => openModal('patientForm')}>+ 新增患者</Button>
        </div>
      </div>
      <StatsBar />
      {/* Doctor summary */}
      {doctorStats.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mb-2 text-[11px]">
          {doctorStats.map(([doc, s]) => (
            <span key={doc} className="text-[var(--color-text-secondary)]">
              <span className="font-semibold text-[var(--color-text)]">{doc}</span>
              <span className="text-[var(--color-text-muted)]"> 病房{s.ward}</span>
              {s.cicu > 0 && <span className="text-[var(--color-text-muted)]"> CICU{s.cicu}</span>}
              {s.other > 0 && <span className="text-[var(--color-text-muted)]"> 其他{s.other}</span>}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {phaseOptions.map((p) => (
          <button key={p} onClick={() => setFilterPhase(p)}
            className={`font-ui text-xs px-2.5 py-1 rounded-full transition-colors ${filterPhase === p ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
          >{phaseLabels[p]}</button>
        ))}
      </div>
      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p className="text-lg mb-2">暂无患者</p>
          <p className="text-sm">点击右上角"新增患者"添加第一位患者</p>
        </div>
      ) : compact ? (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden">
          {filtered.map((p, idx) => {
            const { label, days } = computePhaseDays(p);
            const phaseColor = `var(--phase-${p.phase})`;
            return (
              <div key={p.id} className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] cursor-pointer text-xs last:border-b-0"
                onClick={() => openModal('patientDetail', { patientId: p.id })}>
                <span className="text-[var(--color-text-muted)] w-5 text-right flex-shrink-0">{idx + 1}</span>
                <span className="font-data font-bold w-9 flex-shrink-0" style={{ color: p.attendingDoctor ? getDoctorColor(p.attendingDoctor) : 'var(--color-primary)' }}>{p.bedNumber || '--'}</span>
                <span className="font-semibold text-[var(--color-text)] w-14 flex-shrink-0 truncate">{p.name}</span>
                <span className="text-[var(--color-text-muted)] w-6 flex-shrink-0 text-center">{p.gender === 'male' ? 'M' : 'F'}</span>
                <span className="text-[var(--color-text-muted)] w-5 flex-shrink-0 text-right">{p.age}</span>
                <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-white text-[10px]" style={{ backgroundColor: phaseColor }}>
                  {PHASE_LABELS[p.phase]}{days > 0 ? ` ${days}d` : ''}
                </span>
                <span className="text-[var(--color-text-secondary)] flex-1 truncate">{p.diagnosis}</span>
                <span className="flex gap-0.5 flex-shrink-0 max-w-[140px] overflow-hidden">
                  {p.tags.map(t => <span key={t} className="text-[11px] px-1.5 rounded bg-[var(--color-primary)] text-white whitespace-nowrap">{t}</span>)}
                </span>
                <span className="text-[var(--color-text-muted)] w-14 flex-shrink-0 text-right">{p.attendingDoctor || '--'}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          {filtered.map((p, idx) => (
            <div key={p.id} className="flex items-start gap-2 mb-2.5">
              <span className="text-xs text-[var(--color-text-muted)] w-5 text-right flex-shrink-0 mt-3">{idx + 1}</span>
              <div className="flex-1">
                <PatientCard patient={p} onClick={() => openModal('patientDetail', { patientId: p.id })} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
