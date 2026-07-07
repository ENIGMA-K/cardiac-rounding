import { useRef, useEffect, useState } from 'react';
import { usePatientStore } from '@/store/patientStore';
import { useUIStore } from '@/store/uiStore';
import { getPatientDays, getPhaseColor, getPhaseLabel, dateStr } from '@/lib/gantt-adapter';
import { sortByPhaseProgress } from '@/lib/sort';
import type { ClinicalPhase } from '@/types';
import { PHASE_LABELS } from '@/types';

const phaseOrder: ClinicalPhase[] = ['pre-op','surgery-day','post-op-icu','post-op-ward-monitor','post-op-ward','transfer','discharged'];

interface PhaseEditPopup {
  patientId: string;
  date: string;
  x: number; y: number;
}

export function GanttOverview() {
  const { patients, updatePatient } = usePatientStore();
  const { openModal, addToast } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState<PhaseEditPopup | null>(null);
  const activePatients = patients.filter((p) => !p.archived && p.admissionDate);
  const sorted = sortByPhaseProgress(activePatients);
  const today = new Date(); today.setHours(0,0,0,0);

  const dotSize = 10; const gap = 3; const cellSize = dotSize + gap * 2;
  const labelWidth = 140; const rowHeight = 28; const headerHeight = 22;

  let maxDays = 0;
  for (const p of sorted) {
    const days = getPatientDays(p, today);
    if (days.length > maxDays) maxDays = days.length;
  }
  if (maxDays < 7) maxDays = 7;

  useEffect(() => {
    if (!containerRef.current || sorted.length === 0) return;
    const el = containerRef.current;
    const todayX = labelWidth + (maxDays - 1) * cellSize;
    el.scrollLeft = Math.max(0, todayX - el.clientWidth / 2);
  }, [sorted.length, maxDays]);

  const handleDotClick = (e: React.MouseEvent, patientId: string, date: Date) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopup({ patientId, date: dateStr(date), x: rect.left, y: rect.bottom + 4 });
  };

  const handlePhaseChange = async (newPhase: ClinicalPhase) => {
    if (!popup) return;
    const patient = patients.find(p => p.id === popup.patientId);
    if (!patient) return;
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
    return (
      <div>
        <h2 className="font-ui text-lg font-bold text-[var(--color-text)] mb-3">住院进度甘特图</h2>
        <div className="text-center py-12 text-[var(--color-text-muted)]">暂无住院患者</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-ui text-lg font-bold text-[var(--color-text)] mb-3">住院进度甘特图</h2>
      <div className="border border-[var(--color-border)] rounded-[var(--radius)] bg-[var(--color-surface)] max-w-full">
        <div ref={containerRef} className="overflow-x-auto" style={{ maxWidth: '100%' }}>
          <div style={{ display: 'inline-block', minWidth: '100%' }}>
            {/* Sticky wrapper for labels */}
            <div style={{ position: 'relative' }}>
              {/* Header */}
              <div className="flex border-b border-[var(--color-border)]" style={{ height: headerHeight }}>
                <div className="font-ui text-[10px] font-semibold text-[var(--color-text-secondary)] flex items-center px-2 border-r border-[var(--color-border)] sticky left-0 bg-[var(--color-surface)]" style={{ width: labelWidth, zIndex: 2 }}>
                  患者 / 床号
                </div>
                <div className="flex items-end">
                  {Array.from({ length: maxDays }, (_, i) => (
                    <div key={i} className="text-center" style={{ width: cellSize }}>
                      <span className="text-[8px] text-[var(--color-text-muted)] leading-tight block">{(new Date(today.getTime() - (maxDays - 1 - i) * 86400000)).getDate()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {sorted.map((patient) => {
                const days = getPatientDays(patient, today);
                return (
                  <div key={patient.id} className="flex border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] transition-colors"
                    style={{ height: rowHeight }}
                    onClick={() => openModal('patientDetail', { patientId: patient.id })}>
                    <div className="flex items-center px-2 border-r border-[var(--color-border)] sticky left-0 bg-[var(--color-surface)]" style={{ width: labelWidth, zIndex: 1 }}>
                      <span className="text-[10px] font-semibold mr-1 whitespace-nowrap text-[var(--color-text)]">{patient.name}</span>
                      <span className="text-[9px] text-[var(--color-text-muted)]">{patient.bedNumber || '--'}</span>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: maxDays }, (_, i) => {
                        const dayIdx = i - (maxDays - days.length);
                        if (dayIdx < 0) return <div key={i} style={{ width: cellSize }} />;
                        const day = days[dayIdx];
                        const color = getPhaseColor(day.phase);
                        return (
                          <div key={i} className="flex items-center justify-center cursor-pointer" style={{ width: cellSize }}
                            title={`${day.date.toLocaleDateString('zh-CN')} — ${getPhaseLabel(day.phase)} (点击修改)`}
                            onClick={(e) => handleDotClick(e, patient.id, day.date)}>
                            <div style={{
                              width: dotSize, height: dotSize, borderRadius: '50%', backgroundColor: color,
                              border: day.isToday ? '1.5px solid #fff' : 'none',
                              boxShadow: day.isToday ? '0 0 3px rgba(255,255,255,0.5)' : 'none',
                            }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Phase edit popup */}
        {popup && (
          <div className="fixed z-50 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-[var(--radius)] shadow-lg p-2" style={{ left: popup.x, top: popup.y }}>
            <div className="text-[10px] text-[var(--color-text-muted)] mb-1">{popup.date} 设定阶段：</div>
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {phaseOrder.map((phase) => (
                <button key={phase} className="text-[10px] px-2 py-1 rounded-full text-white hover:opacity-80" style={{ backgroundColor: getPhaseColor(phase) }}
                  onClick={() => handlePhaseChange(phase)}>{PHASE_LABELS[phase]}</button>
              ))}
            </div>
            <button className="text-[10px] text-[var(--color-text-muted)] mt-1" onClick={() => setPopup(null)}>取消</button>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-t border-[var(--color-border)]">
          <span className="text-[10px] text-[var(--color-text-muted)]">图例：</span>
          {phaseOrder.map((phase) => (
            <span key={phase} className="flex items-center gap-0.5 text-[10px] text-[var(--color-text-secondary)]">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: getPhaseColor(phase) }} />
              {PHASE_LABELS[phase]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
