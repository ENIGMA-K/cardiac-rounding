import type { Patient, LabResult } from '@/types';
import { Card } from '@/components/ui/Card';

interface InfoSummaryProps { patient: Patient; labResults: LabResult[]; }

export function InfoSummary({ patient, labResults }: InfoSummaryProps) {
  const latestLab = labResults.length > 0 ? labResults[labResults.length - 1] : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3" glow>
          <h4 className="font-ui text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">基本信息</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">{patient.gender === 'male' ? '男' : '女'} · {patient.age}岁</span>
              <span className="font-data text-[var(--color-text-secondary)]">{patient.bedNumber || '--'}</span>
            </div>
            <div className="text-[var(--color-text-secondary)] text-xs">{patient.diagnosis || '—'}</div>
            <div className="text-[var(--color-text-muted)] text-xs">主管: {patient.attendingDoctor || '—'}</div>
          </div>
        </Card>

        <Card className="p-3" glow>
          <h4 className="font-ui text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">手术信息</h4>
          {patient.surgery?.surgeryType ? (
            <div className="text-sm space-y-1">
              <div className="text-[var(--color-text)] font-medium">{patient.surgery.surgeryType}</div>
              <div className="flex gap-3 text-xs text-[var(--color-text-secondary)]">
                {patient.surgery.cpbTime != null && <span className="font-data">CPB {patient.surgery.cpbTime}min</span>}
                {patient.surgery.crossClampTime != null && <span className="font-data">阻断 {patient.surgery.crossClampTime}min</span>}
                {patient.surgeryDate && <span>{patient.surgeryDate}</span>}
              </div>
            </div>
          ) : (
            <div className="text-sm text-[var(--color-text-muted)]">尚未录入</div>
          )}
        </Card>
      </div>

      {latestLab && (
        <Card className="p-3" glow>
          <h4 className="font-ui text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
            最近化验 {latestLab.source === 'ocr' ? '(OCR)' : ''}
          </h4>
          <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
            {latestLab.cbc?.hb != null && (
              <div className="text-center">
                <div className="font-data text-sm text-[var(--color-text)]">{latestLab.cbc.hb}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Hb g/L</div>
              </div>
            )}
            {latestLab.cbc?.plt != null && (
              <div className="text-center">
                <div className="font-data text-sm text-[var(--color-text)]">{latestLab.cbc.plt}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">PLT</div>
              </div>
            )}
            {latestLab.electrolytes?.k != null && (
              <div className="text-center">
                <div className="font-data text-sm text-[var(--color-text)]">{latestLab.electrolytes.k}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">K⁺</div>
              </div>
            )}
            {latestLab.chemistry?.scr != null && (
              <div className="text-center">
                <div className="font-data text-sm text-[var(--color-text)]">{latestLab.chemistry.scr}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Scr</div>
              </div>
            )}
            {latestLab.coagulation?.inr != null && (
              <div className="text-center">
                <div className="font-data text-sm text-[var(--color-text)]">{latestLab.coagulation.inr}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">INR</div>
              </div>
            )}
            {latestLab.abg?.lactate != null && (
              <div className="text-center">
                <div className="font-data text-sm text-[var(--color-text)]">{latestLab.abg.lactate}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Lac</div>
              </div>
            )}
            {latestLab.abg?.ph != null && (
              <div className="text-center">
                <div className="font-data text-sm text-[var(--color-text)]">{latestLab.abg.ph}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">pH</div>
              </div>
            )}
            {latestLab.electrolytes?.mg != null && (
              <div className="text-center">
                <div className="font-data text-sm text-[var(--color-text)]">{latestLab.electrolytes.mg}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Mg²⁺</div>
              </div>
            )}
          </div>
        </Card>
      )}

    </div>
  );
}
