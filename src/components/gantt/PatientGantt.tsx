import { useEffect, useState } from 'react';
import type { Patient } from '@/types';
import { usePatientStore } from '@/store/patientStore';
import { patientToGanttTasks, getPhaseLabel } from '@/lib/gantt-adapter';
import { PHASE_LABELS } from '@/types';
import type { ClinicalPhase } from '@/types';

const phaseOrder: ClinicalPhase[] = ['pre-op','surgery-day','post-op-icu','post-op-ward-monitor','post-op-ward','transfer'];
const phaseColors: Record<ClinicalPhase, string> = {
  'pre-op':'#80868b','surgery-day':'#c5221f','post-op-icu':'#e37400',
  'post-op-ward-monitor':'#f9ab00','post-op-ward':'#1e8e3e','transfer':'#1a73e8','discharged':'#9aa0a6',
};

interface PatientGanttProps { patientId: string; }

export function PatientGantt({ patientId }: PatientGanttProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const { getPatient } = usePatientStore();
  const today = new Date();

  useEffect(() => { getPatient(patientId).then((p) => { if (p) setPatient(p); }); }, [patientId, getPatient]);
  if (!patient || !patient.admissionDate) return null;

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

  const getSvgX = (date: Date) => labelWidth + ((date.getTime() - admission.getTime()) / 86400000) * dayPx;
  const tx = getSvgX(today);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-ui text-sm font-semibold text-[var(--color-text)]">住院进度甘特图</h4>
        <div className="flex gap-2 text-[10px] text-[var(--color-text-muted)]">
          {phaseOrder.map((p) => (
            <span key={p} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: phaseColors[p] }} />{PHASE_LABELS[p]}
            </span>
          ))}
        </div>
      </div>
      <svg width={svgWidth} height={totalHeight} className="w-full border border-[var(--color-border)] rounded bg-[var(--color-surface)]">
        {/* Today line */}
        <line x1={tx} y1={0} x2={tx} y2={totalHeight} stroke="var(--color-error)" strokeWidth={1.5} strokeDasharray="3,2" />
        <text x={tx + 3} y={10} fill="var(--color-error)" fontSize="9" fontFamily="var(--font-ui)">今天</text>

        {tasks.map((task, i) => {
          const y = i * (barHeight + gap) + 14;
          const x = Math.max(labelWidth, getSvgX(task.startDate));
          const w = Math.max(8, getSvgX(task.endDate) - x);
          const isCurrent = patient.phase === task.phase && task.startDate <= today && task.endDate > today;

          return (
            <g key={i}>
              <text x={2} y={y + 17} fill="var(--color-text-secondary)" fontSize="11" fontFamily="var(--font-ui)">{task.label}</text>
              <rect x={x} y={y} width={w} height={barHeight} rx={3} fill={task.color} opacity={isCurrent ? 1 : 0.65} />
              {isCurrent && <rect x={x} y={y} width={w} height={barHeight} rx={3} fill="none" stroke="var(--color-text)" strokeWidth={1.5} />}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
