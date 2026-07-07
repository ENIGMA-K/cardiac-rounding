import { useEffect, useState } from 'react';
import type { Patient, LabResult, RoundingRecord, TodoItem } from '@/types';
import { SESSION_LABELS, TUBE_LABELS } from '@/types';
import { usePatientStore } from '@/store/patientStore';
import { useRoundingStore } from '@/store/roundingStore';
import { useUIStore } from '@/store/uiStore';
import { db } from '@/lib/db';
import { getPatientDays, getPhaseColor } from '@/lib/gantt-adapter';
import { InfoSummary } from './InfoSummary';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { v4 as uid } from 'uuid';

interface RoundingViewProps { patientId: string; session?: string; recordId?: string; }

export function RoundingView({ patientId, session, recordId }: RoundingViewProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [prevRecord, setPrevRecord] = useState<RoundingRecord | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentRecord, createRecord, loadRecord, setDetailsText, setLabText, setTodos } = useRoundingStore();
  const { getPatient, updatePatient } = usePatientStore();
  const { closeModal, addToast } = useUIStore();

  useEffect(() => {
    (async () => {
      const p = await getPatient(patientId); if (p) setPatient(p);
      const labs = await db.labResults.where('patientId').equals(patientId).reverse().sortBy('date'); setLabResults(labs);
      const prevRecs = await db.roundingRecords.where('patientId').equals(patientId).reverse().sortBy('createdAt');
      if (prevRecs.length > 0) setPrevRecord(prevRecs[0]);
      setLoading(false);
    })();
  }, [patientId, getPatient]);

  useEffect(() => { if (recordId && patient) loadRecord(recordId); }, [recordId, patient, loadRecord]);

  useEffect(() => {
    if (patient && session && !creating && !currentRecord) {
      setCreating(true);
      createRecord(patient.id, patient.phase, session as 'am'|'pm').then(() => setCreating(false))
        .catch((err: Error) => { addToast('创建失败: '+err.message, 'error'); setCreating(false); });
    }
  }, [patient, session, creating, currentRecord, createRecord, addToast]);

  const addTag = async (t?: string) => {
    const newTag = (t || tagInput).trim(); if (!patient || !newTag) return;
    if (patient.tags.includes(newTag)) { setTagInput(''); return; }
    await updatePatient(patient.id, { tags: [...patient.tags, newTag] });
    setPatient({ ...patient, tags: [...patient.tags, newTag] }); setTagInput('');
  };

  if (loading) return <div className="p-6 text-center text-[var(--color-text-muted)]">加载中...</div>;
  if (!patient) return <div className="p-6 text-center text-[var(--color-error)]">患者未找到</div>;
  if (!currentRecord) return <div className="p-6 text-center"><div className="text-[var(--color-text-muted)] mb-2">{recordId?'加载记录...':'准备查房...'}</div><div className="w-8 h-8 mx-auto border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" /></div>;

  const today = new Date(); today.setHours(0,0,0,0);
  const timeline = getPatientDays(patient, today);
  const activeTubes = (patient.tubes || []).filter(t => !t.removedAt);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-2.5">
          <h3 className="font-ui text-sm font-bold text-[var(--color-text)]">{patient.name} · {SESSION_LABELS[currentRecord.session]}</h3>
          <Badge phase={patient.phase} variant="subtle" />
        </div>
        <span className={`font-ui text-xs px-2 py-0.5 rounded-full ${currentRecord.status==='completed'?'bg-[var(--color-success-bg)] text-[var(--color-success)]':'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'}`}>
          {currentRecord.status==='completed'?'已完成':'进行中'}
        </span>
      </div>

      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        {timeline.length>0 && <div className="flex items-center gap-0.5 overflow-x-auto py-1">
          {timeline.map((c,i)=><div key={i} className="flex-shrink-0" style={{width:14}}><div className="w-3 h-3 rounded-sm" style={{backgroundColor:getPhaseColor(c.phase),border:c.isToday?'2px solid #fff':'none'}}/></div>)}
        </div>}

        <Card className="p-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-ui text-xs text-[var(--color-text-muted)]">标签：</span>
            {patient.tags.map(tag=><span key={tag} className="font-ui inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">{tag}<button onClick={()=>updatePatient(patient.id,{tags:patient.tags.filter(x=>x!==tag)}).then(()=>setPatient({...patient,tags:patient.tags.filter(x=>x!==tag)}))} className="hover:text-[var(--color-error)]">&times;</button></span>)}
            <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTag()} placeholder="添加标签" className="font-ui text-xs w-20 px-1.5 py-0.5 min-h-[24px]"/>
            <Button variant="ghost" size="sm" onClick={()=>addTag()} style={{minHeight:'24px',padding:'0 6px',fontSize:'11px'}}>+</Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {['CABG','AVR','MVR','Bentall','夹层','急诊','TAVI','LVAD','房颤','糖尿病','高血压','CKD','COPD','高龄','抗凝','IABP','休克','先心病','新生儿','微创'].filter(t=>!patient.tags.includes(t)).map(t=><button key={t} onClick={()=>addTag(t)} className="text-[10px] px-1.5 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">{t}</button>)}
          </div>
        </Card>

        <InfoSummary patient={patient} labResults={labResults}/>

        {activeTubes.length>0 && <Card className="p-3"><h4 className="font-ui text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">管路</h4>
          <div className="flex flex-wrap gap-1.5">{activeTubes.map(t=><span key={t.id} className="font-ui inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"/>{TUBE_LABELS[t.type]}<span className="text-[var(--color-text-muted)]">{Math.floor((Date.now()-new Date(t.insertedAt).getTime())/86400000)}d</span></span>)}</div>
        </Card>}

        {/* 化验 */}
        <div>
          <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">化验</h4>
          <textarea value={currentRecord.labText||''} onChange={e=>setLabText(e.target.value)} rows={5} className="w-full text-sm resize-none font-ui bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius)] p-3" placeholder="Hb___  PLT___  WBC___&#10;K⁺___  Na⁺___  Ca²⁺___&#10;Scr___  Glc___  Lac___&#10;PT___  INR___  APTT___&#10;pH___  PaO₂___  PaCO₂___"/>
        </div>

        {/* 查房 */}
        <div>
          <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">查房</h4>
          {prevRecord && prevRecord.id!==currentRecord.id && prevRecord.detailsText && <div className="mb-2 p-2 rounded bg-[var(--color-bg)] text-xs text-[var(--color-text-muted)]"><span className="font-semibold">上次：</span>{prevRecord.detailsText.slice(0,150)}...</div>}
          <textarea value={currentRecord.detailsText||''} onChange={e=>setDetailsText(e.target.value)} rows={6} className="w-full text-sm resize-none font-ui bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius)] p-3" placeholder="查房所见、病情变化、处理措施、明日计划…"/>
        </div>

        {/* 待办 */}
        <div>
          <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-2">待办</h4>
          <div className="space-y-1.5">
            {(currentRecord.todos||[]).map((todo:TodoItem)=><div key={todo.id} className="flex items-center gap-2"><input type="checkbox" checked={todo.done} onChange={()=>{const tds=(currentRecord.todos||[]).map(x=>x.id===todo.id?{...x,done:!x.done}:x);setTodos(tds);}} className="w-4 h-4"/><input value={todo.text} onChange={e=>{const tds=(currentRecord.todos||[]).map(x=>x.id===todo.id?{...x,text:e.target.value}:x);setTodos(tds);}} placeholder="待办事项..." className={`font-ui text-sm flex-1 ${todo.done?'line-through text-[var(--color-text-muted)]':''}`}/><button onClick={()=>setTodos((currentRecord.todos||[]).filter(x=>x.id!==todo.id))} className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] text-xs">&times;</button></div>)}
            <Button variant="ghost" size="sm" onClick={()=>setTodos([...(currentRecord.todos||[]),{id:uid(),text:'',done:false}])}>+ 待办</Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={async()=>{await useRoundingStore.getState().saveDraft();addToast('已保存','info');}}>保存</Button>
          <Button size="sm" onClick={async()=>{await useRoundingStore.getState().saveRecord('completed');addToast('查房已完成','success');closeModal();}}>完成查房</Button>
        </div>
        <Button variant="ghost" size="sm" onClick={closeModal}>关闭</Button>
      </div>
    </div>
  );
}
