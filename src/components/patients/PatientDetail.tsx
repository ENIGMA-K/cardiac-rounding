import { useEffect, useState } from 'react';
import type { Patient, RoundingRecord, ClinicalPhase } from '@/types';
import { PHASE_LABELS, PHASE_TRANSITIONS, SESSION_LABELS, TUBE_LABELS } from '@/types';
import { usePatientStore } from '@/store/patientStore';
import { useUIStore } from '@/store/uiStore';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PatientDetailProps { patientId: string; }

export function PatientDetail({ patientId }: PatientDetailProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<RoundingRecord[]>([]);
  const { getPatient, archivePatient, transitionPhase, updatePatient } = usePatientStore();
  const { closeModal, openModal, addToast } = useUIStore();

  useEffect(() => {
    (async () => {
      const p = await getPatient(patientId);
      if (p) setPatient(p);
      const recs = await db.roundingRecords.where('patientId').equals(patientId).reverse().sortBy('createdAt');
      setRecords(recs);
    })();
  }, [patientId, getPatient]);

  if (!patient) return <div className="p-4 text-center text-[var(--color-text-muted)]">加载中...</div>;

  const handleArchive = async () => {
    if (confirm(`确认将 ${patient.name} 归档至已出院列表？`)) { await archivePatient(patient.id); addToast(`${patient.name} 已归档`, 'success'); closeModal(); }
  };
  const handleTransition = async (t: ClinicalPhase) => {
    const label = PHASE_LABELS[t] || t;
    if (confirm(`确认将 ${patient.name} 转入「${label}」阶段？`)) { await transitionPhase(patient.id, t); addToast(`${patient.name} 已转入「${label}」`, 'success'); const p = await getPatient(patient.id); if (p) setPatient(p); }
  };
  const handleRounding = (session: 'am' | 'pm') => { closeModal(); openModal('rounding', { patientId: patient.id, session }); };
  const handleTubeToggle = async (tubeId: string) => {
    if (!patient) return;
    const tube = patient.tubes.find(t => t.id === tubeId);
    if (!tube) return;
    if (tube.removedAt) {
      await updatePatient(patient.id, { tubes: patient.tubes.map(t => t.id === tubeId ? { ...t, removedAt: undefined } : t) });
    } else if (confirm(`确认拔除「${TUBE_LABELS[tube.type]}」？`)) {
      await updatePatient(patient.id, { tubes: patient.tubes.map(t => t.id === tubeId ? { ...t, removedAt: new Date().toISOString() } : t) });
    }
    const p = await getPatient(patient.id); if (p) setPatient(p);
  };
  const transitions = PHASE_TRANSITIONS[patient.phase] || [];

  return (
    <div className="flex flex-col gap-3">
      {/* Basic Info */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-ui text-base font-bold text-[var(--color-text)]">{patient.name}</h3>
          <Badge phase={patient.phase} />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <div><span className="text-[var(--color-text-muted)]">床号：</span><span className="font-data">{patient.bedNumber || '--'}</span></div>
          <div><span className="text-[var(--color-text-muted)]">病历号：</span><span className="font-data">{patient.mrn || '--'}</span></div>
          <div><span className="text-[var(--color-text-muted)]">性别：</span><span>{patient.gender === 'male' ? '男' : '女'}</span></div>
          <div><span className="text-[var(--color-text-muted)]">年龄：</span><span className="font-data">{patient.age} 岁</span></div>
          <div><span className="text-[var(--color-text-muted)]">入院日期：</span><span>{patient.admissionDate}</span></div>
          {patient.surgeryDate && <div><span className="text-[var(--color-text-muted)]">手术日期：</span><span>{patient.surgeryDate}</span></div>}
          <div><span className="text-[var(--color-text-muted)]">主管医生：</span><span>{patient.attendingDoctor || '--'}</span></div>
        </div>
        <div className="mt-2"><span className="text-[var(--color-text-muted)] text-sm">诊断：</span><span className="text-sm">{patient.diagnosis || '--'}</span></div>
        {patient.comorbidities.length > 0 && <div className="mt-1"><span className="text-[var(--color-text-muted)] text-sm">合并症：</span><span className="text-sm">{patient.comorbidities.join('、')}</span></div>}
        {patient.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{patient.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white">{t}</span>)}</div>}
      </Card>

      {/* Surgery */}
      {patient.surgery && (
        <Card className="p-4">
          <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">手术信息</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <div><span className="text-[var(--color-text-muted)]">术式：</span><span>{patient.surgery.surgeryType}</span></div>
            {patient.surgery.cpbTime != null && <div><span className="text-[var(--color-text-muted)]">CPB：</span><span className="font-data">{patient.surgery.cpbTime} min</span></div>}
            {patient.surgery.crossClampTime != null && <div><span className="text-[var(--color-text-muted)]">阻断：</span><span className="font-data">{patient.surgery.crossClampTime} min</span></div>}
          </div>
        </Card>
      )}

      {/* Tubes */}
      {patient.tubes && patient.tubes.filter(t => !t.removedAt).length > 0 && (
        <Card className="p-4">
          <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">管路状态</h4>
          <div className="flex flex-wrap gap-2">
            {patient.tubes.filter(t => !t.removedAt).map((tube) => {
              const dsi = Math.floor((Date.now() - new Date(tube.insertedAt).getTime()) / 86400000);
              return (
                <span key={tube.id} onClick={(e) => { e.stopPropagation(); handleTubeToggle(tube.id); }}
                  className="font-ui inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border cursor-pointer bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-error)] transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                  {TUBE_LABELS[tube.type]}
                  <span className="text-[var(--color-text-muted)]">{dsi}d</span>
                </span>
              );
            })}
          </div>
        </Card>
      )}

      {/* Transitions */}
      {transitions.length > 0 && (
        <Card className="p-3">
          <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">阶段调整</h4>
          <div className="flex flex-wrap gap-2">
            {transitions.map((t) => <Button key={t.target} size="sm" variant="outline" onClick={() => handleTransition(t.target)}>{t.label}</Button>)}
          </div>
        </Card>
      )}

      {/* Latest Round Full Content */}
      {records.length > 0 && (
        <Card className="p-4 border-l-2" style={{ borderLeftColor: 'var(--color-primary)' }}>
          <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">
            最近查房 ({records[0].createdAt.slice(0,10)} {(SESSION_LABELS as Record<string,string>)[records[0].session] || ''})
            <span className={`font-ui ml-2 text-xs px-1.5 py-0.5 rounded ${records[0].status === 'completed' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'}`}>
              {records[0].status === 'completed' ? '已完成' : '草稿'}
            </span>
          </h4>
          {records[0].detailsText ? (
            <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{records[0].detailsText}</p>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">无查房记录</p>
          )}
          <div className="mt-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); closeModal(); openModal('rounding', { patientId: patient.id, recordId: records[0].id }); }}>
              查看/编辑此记录
            </Button>
          </div>
        </Card>
      )}

      {/* History */}
      <Card className="p-4">
        <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">
          历次查房记录 {records.length > 1 && <span className="font-normal text-xs text-[var(--color-text-muted)]">(共{records.length}次)</span>}
        </h4>
        {records.length <= 1 ? (
          <p className="text-sm text-[var(--color-text-muted)]">暂无历史记录</p>
        ) : (
          <div className="space-y-1 max-h-[260px] overflow-y-auto">
            {records.slice(1).map((rec) => {
              const date = rec.createdAt.slice(0, 10);
              const time = rec.createdAt.slice(11, 16);
              return (
                <div key={rec.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-[var(--color-surface-hover)] text-sm cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); closeModal(); openModal('rounding', { patientId: patient.id, recordId: rec.id }); }} title="点击查看/编辑">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${rec.status === 'completed' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} />
                    <span className="text-[var(--color-text)] whitespace-nowrap">{date} {time}</span>
                    <span className="text-[var(--color-text-secondary)] truncate">· {PHASE_LABELS[rec.phase] || rec.phase} · {(SESSION_LABELS as Record<string,string>)[rec.session] || rec.session}</span>
                    {rec.detailsText && <span className="text-[var(--color-text-muted)] text-xs truncate hidden sm:inline">— {rec.detailsText.slice(0, 30)}...</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-ui ${rec.status === 'completed' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'}`}>
                      {rec.status === 'completed' ? '已完成' : '草稿'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { closeModal(); openModal('patientForm', { patient }); }}>编辑</Button>
          {!patient.archived && <Button variant="danger" size="sm" onClick={handleArchive}>归档至出院</Button>}
        </div>
        <div className="flex gap-2">
          {!patient.archived && <Button size="sm" onClick={() => handleRounding('am')}>开始早查房</Button>}
          {!patient.archived && <Button size="sm" onClick={() => handleRounding('pm')}>开始晚查房</Button>}
        </div>
      </div>
    </div>
  );
}
