import type { ClinicalPhase } from '@/types';
import { usePatientStore } from '@/store/patientStore';

const phaseOrder: ClinicalPhase[] = ['pre-op', 'surgery-day', 'post-op-icu', 'post-op-ward-monitor', 'post-op-ward', 'transfer', 'discharged'];
const phaseLabels: Record<ClinicalPhase, string> = { 'pre-op': '术前', 'surgery-day': '手术日', 'post-op-icu': '术后监护', 'post-op-ward-monitor': '病房监护', 'post-op-ward': '术后病房', 'transfer': '转出', 'discharged': '已出院' };

export function StatsBar() {
  const patients = usePatientStore((s) => s.patients);

  const counts = phaseOrder.map((phase) => ({
    phase, label: phaseLabels[phase], count: patients.filter((p) => p.phase === phase).length,
  }));

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {counts.map(({ phase, label, count }) => (
        <span key={phase} className="font-ui inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `var(--phase-${phase})` }} />
          {label} <span className="font-semibold text-[var(--color-text)]">{count}</span>
        </span>
      ))}
    </div>
  );
}
