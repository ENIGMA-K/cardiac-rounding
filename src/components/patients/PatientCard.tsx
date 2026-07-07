import type { Patient } from '@/types';
import { PHASE_LABELS } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { computePhaseDays, getDoctorColor } from '@/lib/sort';

interface PatientCardProps { patient: Patient; onClick?: () => void; }

export function PatientCard({ patient, onClick }: PatientCardProps) {
  const { openModal } = useUIStore();
  const phaseColor = `var(--phase-${patient.phase})`;
  const { label: daysLabel, days } = computePhaseDays(patient);

  return (
    <Card className="flex overflow-hidden hover:shadow-md transition-shadow" hoverable onClick={onClick}>
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: phaseColor }} />
      <div className="flex-1 p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-data text-base font-bold min-w-[2rem]" style={{ color: patient.attendingDoctor ? getDoctorColor(patient.attendingDoctor) : 'var(--color-primary)' }}>{patient.bedNumber || '--'}</span>
            <span className="font-bold text-[var(--color-text)]">{patient.name}</span>
            <span className="text-sm text-[var(--color-text-secondary)]">{patient.gender === 'male' ? '男' : '女'} {patient.age}岁</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-data text-xs px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: phaseColor }}>{PHASE_LABELS[patient.phase]}</span>
            {days > 0 && <span className="font-data text-xs text-[var(--color-text-muted)]">{daysLabel}{days}天</span>}
            {days === 0 && daysLabel === '手术日' && <span className="font-data text-xs text-[var(--color-error)]">手术日</span>}
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mb-1.5">{patient.surgery?.surgeryType || patient.diagnosis || '—'}</p>
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mb-1.5">
          <span>入院: {patient.admissionDate}</span>
          {patient.surgeryDate && <span>手术: {patient.surgeryDate}</span>}
          {patient.attendingDoctor && <span>主管: {patient.attendingDoctor}</span>}
        </div>
        {patient.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {patient.tags.map(tag => (
              <span key={tag} className="font-ui text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={() => openModal('rounding', { patientId: patient.id, session: 'am' })}>早查房</Button>
          <Button size="sm" variant="outline" onClick={() => openModal('rounding', { patientId: patient.id, session: 'pm' })}>晚查房</Button>
        </div>
      </div>
    </Card>
  );
}
