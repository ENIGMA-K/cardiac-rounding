import { useState } from 'react';
import { v4 as uid } from 'uuid';
import type { Patient, ClinicalPhase, SurgeryInfo, CTFFR, TubeInfo, TubeType } from '@/types';
import { TUBE_LABELS } from '@/types';
import type { PatientFormData } from '@/store/patientStore';
import { Button } from '@/components/ui/Button';

const phaseOptions: { value: ClinicalPhase; label: string }[] = [
  { value: 'pre-op', label: '术前' }, { value: 'surgery-day', label: '手术日' },
  { value: 'post-op-icu', label: '术后监护' }, { value: 'post-op-ward-monitor', label: '病房监护' },
  { value: 'post-op-ward', label: '术后病房' }, { value: 'transfer', label: '转出' },
];

interface PatientFormProps { patient?: Patient; onSave: (data: PatientFormData) => void; onCancel: () => void; }

export function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
  const [name, setName] = useState(patient?.name || '');
  const [gender, setGender] = useState<'male'|'female'>(patient?.gender || 'male');
  const [age, setAge] = useState(patient?.age?.toString() || '');
  const [mrn, setMrn] = useState(patient?.mrn || '');
  const [bedNumber, setBedNumber] = useState(patient?.bedNumber || '');
  const [diagnosis, setDiagnosis] = useState(patient?.diagnosis || '');
  const [admissionDate, setAdmissionDate] = useState(patient?.admissionDate || new Date().toISOString().split('T')[0]);
  const [surgeryDate, setSurgeryDate] = useState(patient?.surgeryDate || '');
  const [phase, setPhase] = useState<ClinicalPhase>(patient?.phase || 'pre-op');
  const [attendingDoctor, setAttendingDoctor] = useState(patient?.attendingDoctor || '');
  const [comorbidities, setComorbidities] = useState(patient?.comorbidities?.join(', ') || '');
  const [tags, setTags] = useState(patient?.tags?.join(', ') || '');
  const [notes, setNotes] = useState(patient?.notes || '');
  const [showSurgery, setShowSurgery] = useState(!!patient?.surgery);
  const [surgeryType, setSurgeryType] = useState(patient?.surgery?.surgeryType || '');
  const [surgeryDetail, setSurgeryDetail] = useState(patient?.surgery?.surgeryDetail || '');
  const [cathDate, setCathDate] = useState(patient?.surgery?.cathDate || '');
  const [cathFindings, setCathFindings] = useState(patient?.surgery?.cathFindings || '');
  const [cathApproach, setCathApproach] = useState<string>(patient?.surgery?.cathApproach || '');
  const [ctffrLad, setCtffrLad] = useState(patient?.surgery?.ctffr?.lad?.toString() || '');
  const [ctffrLcx, setCtffrLcx] = useState(patient?.surgery?.ctffr?.lcx?.toString() || '');
  const [ctffrRca, setCtffrRca] = useState(patient?.surgery?.ctffr?.rca?.toString() || '');
  const [cpbTime, setCpbTime] = useState(patient?.surgery?.cpbTime?.toString() || '');
  const [crossClampTime, setCrossClampTime] = useState(patient?.surgery?.crossClampTime?.toString() || '');
  const [cmrLge, setCmrLge] = useState(patient?.surgery?.cmrLgeSegments?.toString() || '');
  const [intraopComplications, setIntraopComplications] = useState(patient?.surgery?.intraopComplications || '');
  const [tubes, setTubes] = useState<TubeInfo[]>(patient?.tubes || []);
  const [newTubeType, setNewTubeType] = useState<TubeType | ''>('');
  const [newTubeDate, setNewTubeDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const addTube = () => {
    if (!newTubeType) return;
    setTubes([...tubes, { id: uid(), type: newTubeType as TubeType, insertedAt: newTubeDate + 'T00:00:00' }]);
    setNewTubeType('');
    setNewTubeDate(new Date().toISOString().split('T')[0]);
  };
  const removeTube = (id: string) => setTubes(tubes.filter(t => t.id !== id));

  const labelClass = "block font-ui text-xs text-[var(--color-text-secondary)] mb-0.5";
  const inputClass = "font-ui w-full";

  const buildSurgery = (): SurgeryInfo | undefined => {
    if (!showSurgery || !surgeryType.trim()) return undefined;
    const ctffr: CTFFR = {};
    if (ctffrLad) ctffr.lad = parseFloat(ctffrLad);
    if (ctffrLcx) ctffr.lcx = parseFloat(ctffrLcx);
    if (ctffrRca) ctffr.rca = parseFloat(ctffrRca);
    return {
      surgeryType: surgeryType.trim(), surgeryDetail: surgeryDetail.trim() || undefined,
      cathDate: cathDate || undefined, cathFindings: cathFindings.trim() || undefined,
      cathApproach: (cathApproach as 'radial'|'femoral') || undefined,
      ctffr: Object.keys(ctffr).length > 0 ? ctffr : undefined,
      cpbTime: cpbTime ? parseInt(cpbTime) : undefined, crossClampTime: crossClampTime ? parseInt(crossClampTime) : undefined,
      cmrLgeSegments: cmrLge ? parseInt(cmrLge) : undefined,
      intraopComplications: intraopComplications.trim() || undefined,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string,string> = {};
    if (!name.trim()) errs.name = '必填';
    if (!age || isNaN(parseInt(age))) errs.age = '请输入有效年龄';
    if (!bedNumber.trim()) errs.bedNumber = '必填';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      name: name.trim(), gender, age: parseInt(age), mrn: mrn.trim(), bedNumber: bedNumber.trim(),
      diagnosis: diagnosis.trim(), comorbidities: comorbidities.split(',').map((s)=>s.trim()).filter(Boolean),
      admissionDate, surgeryDate: surgeryDate || undefined, phase, attendingDoctor: attendingDoctor.trim(),
      surgery: buildSurgery(), tubes, phaseHistory: patient?.phaseHistory || [{ phase, date: admissionDate }], tags: tags.split(',').map((s)=>s.trim()).filter(Boolean), notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-h-[65vh] overflow-y-auto pr-1">
      {/* Row 1: 姓名 性别 年龄 床号 */}
      <div className="grid grid-cols-4 gap-3">
        <div><label className={labelClass}>姓名 *</label><input value={name} onChange={(e)=>setName(e.target.value)} className={inputClass} style={{borderColor: errors.name ? 'var(--color-error)':''}} /></div>
        <div><label className={labelClass}>性别</label><select value={gender} onChange={(e)=>setGender(e.target.value as 'male'|'female')} className={inputClass}><option value="male">男</option><option value="female">女</option></select></div>
        <div><label className={labelClass}>年龄 *</label><input type="number" value={age} onChange={(e)=>setAge(e.target.value)} className={`font-data ${inputClass}`} style={{borderColor: errors.age ? 'var(--color-error)':''}} /></div>
        <div><label className={labelClass}>床号 *</label><input value={bedNumber} onChange={(e)=>setBedNumber(e.target.value)} className={`font-data ${inputClass}`} style={{borderColor: errors.bedNumber ? 'var(--color-error)':''}} /></div>
      </div>

      {/* Row 2: 病历号 入院日期 手术日期 阶段 */}
      <div className="grid grid-cols-4 gap-3">
        <div><label className={labelClass}>病历号</label><input value={mrn} onChange={(e)=>setMrn(e.target.value)} className={`font-data ${inputClass}`} /></div>
        <div><label className={labelClass}>入院日期</label><input type="date" value={admissionDate} onChange={(e)=>setAdmissionDate(e.target.value)} className={inputClass} /></div>
        <div className="relative"><label className={labelClass}>手术日期</label><input type="date" value={surgeryDate} onChange={(e)=>setSurgeryDate(e.target.value)} className={`${inputClass} pr-6`} />{surgeryDate && <button type="button" onClick={() => setSurgeryDate('')} className="absolute right-2 top-[26px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm">✕</button>}</div>
        <div><label className={labelClass}>临床阶段</label><select value={phase} onChange={(e)=>setPhase(e.target.value as ClinicalPhase)} className={inputClass}>{phaseOptions.map((p)=><option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
      </div>

      {/* Row 3: 诊断 */}
      <div><label className={labelClass}>主要诊断</label><textarea value={diagnosis} onChange={(e)=>setDiagnosis(e.target.value)} rows={2} className={inputClass} /></div>

      {/* Row 4: 主管 合并症 模式 */}
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>主管医生</label><input value={attendingDoctor} onChange={(e)=>setAttendingDoctor(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>合并症</label><input value={comorbidities} onChange={(e)=>setComorbidities(e.target.value)} placeholder="逗号分隔" className={inputClass} /></div>
      </div>

      {/* Tags + Notes */}
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>标签</label><input value={tags} onChange={(e)=>setTags(e.target.value)} placeholder="逗号分隔, 如: CABG, 糖尿病" className={inputClass} /></div>
        <div><label className={labelClass}>备注</label><input value={notes} onChange={(e)=>setNotes(e.target.value)} className={inputClass} /></div>
      </div>

      {/* Surgery Section */}
      <div className="border-t border-[var(--color-border)] pt-3">
        <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">手术信息（非必填）</h4>
        <label className="font-ui flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-secondary)]">
          <input type="checkbox" checked={showSurgery} onChange={(e)=>setShowSurgery(e.target.checked)} className="w-4 h-4" />
          填写手术详情（造影、术式、CTFFR、CPB参数等）
        </label>
      </div>

      {showSurgery && (
        <div className="border border-[var(--color-border)] rounded-md p-3 grid grid-cols-2 gap-3 bg-[var(--color-bg)]">
          <div className="col-span-2"><label className={labelClass}>手术方式</label><input value={surgeryType} onChange={(e)=>setSurgeryType(e.target.value)} placeholder="如: CABG×4, AVR, Bentall手术" className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass}>手术详情</label><input value={surgeryDetail} onChange={(e)=>setSurgeryDetail(e.target.value)} placeholder="桥血管配置等" className={inputClass} /></div>
          <div><label className={labelClass}>造影日期</label><input type="date" value={cathDate} onChange={(e)=>setCathDate(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>造影入路</label><select value={cathApproach} onChange={(e)=>setCathApproach(e.target.value)} className={inputClass}><option value="">--</option><option value="radial">桡动脉</option><option value="femoral">股动脉</option></select></div>
          <div className="col-span-2"><label className={labelClass}>造影结果</label><textarea value={cathFindings} onChange={(e)=>setCathFindings(e.target.value)} rows={1} className={inputClass} /></div>
          <div className="col-span-2">
            <label className={labelClass}>CT-FFR</label>
            <div className="flex gap-2">
              <div className="flex-1"><input type="number" step="0.01" value={ctffrLad} onChange={(e)=>setCtffrLad(e.target.value)} placeholder="LAD" className="font-data w-full" /></div>
              <div className="flex-1"><input type="number" step="0.01" value={ctffrLcx} onChange={(e)=>setCtffrLcx(e.target.value)} placeholder="LCX" className="font-data w-full" /></div>
              <div className="flex-1"><input type="number" step="0.01" value={ctffrRca} onChange={(e)=>setCtffrRca(e.target.value)} placeholder="RCA" className="font-data w-full" /></div>
            </div>
          </div>
          <div><label className={labelClass}>CPB时间 (min)</label><input type="number" value={cpbTime} onChange={(e)=>setCpbTime(e.target.value)} className="font-data w-full" /></div>
          <div><label className={labelClass}>阻断时间 (min)</label><input type="number" value={crossClampTime} onChange={(e)=>setCrossClampTime(e.target.value)} className="font-data w-full" /></div>
          <div><label className={labelClass}>CMR LGE节段数</label><input type="number" value={cmrLge} onChange={(e)=>setCmrLge(e.target.value)} className="font-data w-full" /></div>
          <div className="col-span-2"><label className={labelClass}>术中并发症</label><textarea value={intraopComplications} onChange={(e)=>setIntraopComplications(e.target.value)} rows={1} className={inputClass} /></div>
        </div>
      )}

      {/* Tubes Management */}
      <div className="border-t border-[var(--color-border)] pt-3">
        <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">管路管理（导管/引流管）</h4>
        {tubes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tubes.map((tube) => (
              <span key={tube.id} className="font-ui inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                {TUBE_LABELS[tube.type]}
                <span className="text-[var(--color-text-muted)]">{tube.insertedAt.slice(0,10)}</span>
                <button type="button" onClick={() => removeTube(tube.id)} className="text-[var(--color-error)] hover:text-[var(--color-text)] ml-0.5">&times;</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <div className="w-48">
            <label className={labelClass}>导管类型</label>
            <select value={newTubeType} onChange={(e) => setNewTubeType(e.target.value as TubeType | '')} className={inputClass}>
              <option value="">--选择--</option>
              {(Object.entries(TUBE_LABELS) as [TubeType, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="w-36">
            <label className={labelClass}>置入日期</label>
            <input type="date" value={newTubeDate} onChange={(e) => setNewTubeDate(e.target.value)} className={inputClass} />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addTube}>+ 添加</Button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
        <Button variant="ghost" type="button" onClick={onCancel}>取消</Button>
        <Button type="submit">{patient ? '保存修改' : '添加患者'}</Button>
      </div>
    </form>
  );
}
