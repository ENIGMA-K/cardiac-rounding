import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type CalcType = 'vis' | 'euroscore' | 'crcl' | 'cha2ds2' | 'hasbled';

interface CalculatorPageProps {
  patientId?: string;
  onTagSave?: (tag: string) => void;
  onClose?: () => void;
}

export function CalculatorPage({ patientId, onTagSave, onClose }: CalculatorPageProps) {
  const [tab, setTab] = useState<CalcType>('vis');

  const handleTagSave = (tag: string) => {
    onTagSave?.(tag);
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      {onClose && (
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="font-ui text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">← 返回查房</button>
        </div>
      )}
      {!onTagSave && <h2 className="font-ui text-lg font-bold text-[var(--color-text)]">临床计算器</h2>}
      <div className="flex flex-wrap gap-1.5">
        {([
          ['vis', 'VIS 血管活性药评分'],
          ['euroscore', 'EuroSCORE II'],
          ['crcl', 'CrCl 肌酐清除率'],
          ['cha2ds2', 'CHA₂DS₂-VASc'],
          ['hasbled', 'HAS-BLED'],
        ] as [CalcType, string][]).map(([k, v]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`font-ui text-xs px-3 py-1.5 rounded-full transition-colors ${tab === k ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}>
            {v}
          </button>
        ))}
      </div>

      {tab === 'vis' && <VISCalc onTagSave={onTagSave ? handleTagSave : undefined} />}
      {tab === 'euroscore' && <EuroSCORE onTagSave={onTagSave ? handleTagSave : undefined} />}
      {tab === 'crcl' && <CrClCalc onTagSave={onTagSave ? handleTagSave : undefined} />}
      {tab === 'cha2ds2' && <CHA2DS2 onTagSave={onTagSave ? handleTagSave : undefined} />}
      {tab === 'hasbled' && <HASBLED onTagSave={onTagSave ? handleTagSave : undefined} />}
    </div>
  );
}

/* ─── VIS ─── */
const drugs = [
  { key: 'dopamine', label: '多巴胺', dflt: 200, unit: 'mg' },
  { key: 'dobutamine', label: '多巴酚丁胺', dflt: 200, unit: 'mg' },
  { key: 'epinephrine', label: '肾上腺素', dflt: 4, unit: 'mg' },
  { key: 'norepinephrine', label: '去甲肾上腺素', dflt: 8, unit: 'mg' },
  { key: 'milrinone', label: '米力农', dflt: 10, unit: 'mg' },
  { key: 'vasopressin', label: '血管加压素', dflt: 20, unit: 'U' },
];

function TagBtn({ label, value, onTagSave }: { label: string; value: string; onTagSave?: (t: string) => void }) {
  if (!onTagSave) return null;
  return <Button size="sm" variant="outline" className="mt-2" onClick={() => onTagSave(`${label}=${value}`)}>📌 保存为标签</Button>;
}

function VISCalc({ onTagSave }: { onTagSave?: (t: string) => void }) {
  const [weight, setWeight] = useState('70');
  const [state, setState] = useState<Record<string, { dose: string; rate: string }>>(
    Object.fromEntries(drugs.map(d => [d.key, { dose: '', rate: '' }]))
  );
  const [result, setResult] = useState<{ vis: number } | null>(null);
  const calc = () => {
    const w = parseFloat(weight) || 70; let vis = 0;
    for (const d of drugs) {
      const s = state[d.key]; const dose = parseFloat(s.dose) || 0; const rate = parseFloat(s.rate) || 0;
      if (dose <= 0 || rate <= 0) continue;
      const v = d.unit === 'U' ? dose * rate / (50 * 60 * w) : (dose * 1000 * rate) / (50 * 60 * w);
      const m: Record<string, number> = { dopamine: 1, dobutamine: 1, epinephrine: 100, norepinephrine: 100, milrinone: 10, vasopressin: 10000 };
      vis += v * (m[d.key] || 1);
    }
    setResult({ vis: Math.round(vis * 10) / 10 });
  };
  return (
    <Card className="p-4">
      <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-3">VIS 血管活性药物评分</h4>
      <div className="mb-3"><label className="text-xs text-[var(--color-text-secondary)]">体重 (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="font-data text-sm w-24 ml-2" /></div>
      {drugs.map(d => (
        <div key={d.key} className="flex items-center gap-2 text-xs mb-1">
          <span className="w-20 text-[var(--color-text-secondary)]">{d.label}</span>
          <input type="number" placeholder={String(d.dflt)} value={state[d.key].dose} onChange={e => setState(p => ({ ...p, [d.key]: { ...p[d.key], dose: e.target.value } }))} className="font-data w-14 px-1 py-0.5 text-xs" />
          <span className="text-[var(--color-text-muted)] w-5">{d.unit}</span>
          <span className="text-[var(--color-text-muted)]">泵速</span>
          <input type="number" placeholder="0" value={state[d.key].rate} onChange={e => setState(p => ({ ...p, [d.key]: { ...p[d.key], rate: e.target.value } }))} className="font-data w-14 px-1 py-0.5 text-xs" />
          <span className="text-[var(--color-text-muted)]">mL/h</span>
        </div>
      ))}
      <div className="flex gap-2 mt-3"><Button size="sm" onClick={calc}>计算</Button></div>
      {result && <div className="mt-3 text-center"><div className="font-data text-4xl font-bold text-[var(--color-primary)]">{result.vis.toFixed(1)}</div><div className="text-xs text-[var(--color-text-muted)] mt-1">0-5 轻度 · 5-15 中度 · 15-30 中重度 · &gt;30 重度</div><TagBtn label="VIS" value={result.vis.toFixed(1)} onTagSave={onTagSave} /></div>}
    </Card>
  );
}

/* ─── EuroSCORE II ─── */
const euroFields: { key: string; label: string; points: number }[] = [
  { key: 'age', label: '年龄 ≥ 60', points: 1 },
  { key: 'female', label: '女性', points: 1 },
  { key: 'copd', label: '慢性肺病/COPD', points: 2 },
  { key: 'arterial', label: '心外动脉疾病', points: 2 },
  { key: 'neuro', label: '神经系统功能障碍', points: 2 },
  { key: 'prevSurg', label: '既往心脏手术', points: 3 },
  { key: 'crea200', label: '术前肌酐 > 200 μmol/L', points: 2 },
  { key: 'endocarditis', label: '活动性心内膜炎', points: 3 },
  { key: 'critical', label: '术前危急状态', points: 3 },
  { key: 'unstable', label: '不稳定心绞痛', points: 2 },
  { key: 'lvEF30', label: 'LVEF 30-50%', points: 1 },
  { key: 'lvEF30severe', label: 'LVEF < 30%', points: 3 },
  { key: 'mi90', label: '近期心梗 (< 90天)', points: 2 },
  { key: 'pasp60', label: '肺动脉高压 (PASP > 60mmHg)', points: 2 },
  { key: 'emergency', label: '急诊手术', points: 2 },
  { key: 'cabgOnly', label: '单纯CABG', points: -1 },
  { key: 'thoracic', label: '胸主动脉手术', points: 3 },
  { key: 'postMiVSD', label: '心梗后室间隔穿孔', points: 4 },
];
function EuroSCORE({ onTagSave }: { onTagSave?: (t: string) => void }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setChecks(c => ({ ...c, [k]: !c[k] }));
  const total = euroFields.filter(f => checks[f.key]).reduce((s, f) => s + f.points, 0);
  const risk = total <= 2 ? '低危 (<2%)' : total <= 5 ? '中危 (3-5%)' : total <= 8 ? '高危 (6-10%)' : '极高危 (>10%)';
  return (
    <Card className="p-4">
      <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-3">EuroSCORE II（简化）</h4>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {euroFields.map(f => (
          <label key={f.key} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] cursor-pointer py-0.5">
            <input type="checkbox" checked={!!checks[f.key]} onChange={() => toggle(f.key)} className="w-3.5 h-3.5" />
            {f.label} ({f.points > 0 ? '+' : ''}{f.points})
          </label>
        ))}
      </div>
      <div className="mt-4 text-center">
        <div className="font-data text-3xl font-bold text-[var(--color-primary)]">{total}</div>
        <div className="text-sm mt-1 text-[var(--color-text-secondary)]">{risk}</div>
        <div className="text-xs text-[var(--color-text-muted)] mt-1">总分 0-22 · 分数越高风险越大</div>
        <TagBtn label="EuroSCORE" value={String(total)} onTagSave={onTagSave} />
      </div>
    </Card>
  );
}

/* ─── CrCl (Cockcroft-Gault) ─── */
function CrClCalc({ onTagSave }: { onTagSave?: (t: string) => void }) {
  const [age, setAge] = useState('65');
  const [weight, setWeight] = useState('70');
  const [scr, setScr] = useState('1.0');
  const [gender, setGender] = useState<'m'|'f'>('m');
  const crcl = scr ? Math.round(((140 - (parseInt(age) || 65)) * (parseFloat(weight) || 70)) / (72 * parseFloat(scr)) * (gender === 'f' ? 0.85 : 1)) : 0;
  return (
    <Card className="p-4">
      <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-3">CrCl 肌酐清除率 (Cockcroft-Gault)</h4>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-[var(--color-text-secondary)]">年龄</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className="font-data text-sm" /></div>
        <div><label className="text-xs text-[var(--color-text-secondary)]">体重 (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="font-data text-sm" /></div>
        <div><label className="text-xs text-[var(--color-text-secondary)]">Scr (mg/dL)</label><input type="number" step="0.01" value={scr} onChange={e => setScr(e.target.value)} className="font-data text-sm" /></div>
        <div><label className="text-xs text-[var(--color-text-secondary)]">性别</label><select value={gender} onChange={e => setGender(e.target.value as 'm'|'f')} className="text-sm"><option value="m">男</option><option value="f">女</option></select></div>
      </div>
      <div className="mt-4 text-center">
        <div className="font-data text-3xl font-bold text-[var(--color-primary)]">{crcl}</div>
        <div className="text-sm text-[var(--color-text-secondary)]">mL/min</div>
        <TagBtn label="CrCl" value={String(crcl)} onTagSave={onTagSave} />
      </div>
    </Card>
  );
}

/* ─── CHA₂DS₂-VASc ─── */
const chaFields: { key: string; label: string; points: number }[] = [
  { key: 'chf', label: '心衰/EF ≤ 40%', points: 1 },
  { key: 'htn', label: '高血压', points: 1 },
  { key: 'age75', label: '年龄 ≥ 75岁', points: 2 },
  { key: 'dm', label: '糖尿病', points: 1 },
  { key: 'stroke', label: '卒中/TIA/血栓', points: 2 },
  { key: 'vascular', label: '血管疾病', points: 1 },
  { key: 'age65', label: '年龄 65-74岁', points: 1 },
  { key: 'female', label: '女性', points: 1 },
];
function CHA2DS2({ onTagSave }: { onTagSave?: (t: string) => void }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setChecks(c => ({ ...c, [k]: !c[k] }));
  const total = chaFields.filter(f => checks[f.key]).reduce((s, f) => s + f.points, 0);
  const rec = total === 0 ? '无需抗凝' : total === 1 ? '考虑抗凝' : '建议抗凝';
  const strokeRisk = total === 0 ? '0%' : total === 1 ? '1.3%' : total === 2 ? '2.2%' : total === 3 ? '3.2%' : total === 4 ? '4.0%' : total === 5 ? '6.7%' : total >= 6 ? '9.8%+' : '';
  return (
    <Card className="p-4">
      <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-3">CHA₂DS₂-VASc 评分</h4>
      {chaFields.map(f => (
        <label key={f.key} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] py-0.5 cursor-pointer">
          <input type="checkbox" checked={!!checks[f.key]} onChange={() => toggle(f.key)} className="w-3.5 h-3.5" />{f.label} ({f.points}分)
        </label>
      ))}
      <div className="mt-4 text-center">
        <div className="font-data text-3xl font-bold text-[var(--color-primary)]">{total}</div>
        <div className="text-sm mt-1 text-[var(--color-text-secondary)]">{rec} · 年卒中风险 {strokeRisk}</div>
        <TagBtn label="CHA2DS2" value={String(total)} onTagSave={onTagSave} />
      </div>
    </Card>
  );
}

/* ─── HAS-BLED ─── */
const hasbledFields: { key: string; label: string; points: number }[] = [
  { key: 'htn', label: '高血压 (SBP > 160)', points: 1 },
  { key: 'renal', label: '肾功能异常', points: 1 },
  { key: 'liver', label: '肝功能异常', points: 1 },
  { key: 'stroke', label: '卒中史', points: 1 },
  { key: 'bleed', label: '出血史/倾向', points: 1 },
  { key: 'labile', label: 'INR不稳定', points: 1 },
  { key: 'elderly', label: '年龄 > 65岁', points: 1 },
  { key: 'drugs', label: '抗血小板药/NSAIDs', points: 1 },
  { key: 'alcohol', label: '酗酒', points: 1 },
];
function HASBLED({ onTagSave }: { onTagSave?: (t: string) => void }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setChecks(c => ({ ...c, [k]: !c[k] }));
  const total = hasbledFields.filter(f => checks[f.key]).length;
  const risk = total < 2 ? '低出血风险' : total >= 3 ? '高出血风险（需谨慎）' : '中等风险';
  return (
    <Card className="p-4">
      <h4 className="font-ui text-sm font-semibold text-[var(--color-text)] mb-3">HAS-BLED 出血风险评分</h4>
      {hasbledFields.map(f => (
        <label key={f.key} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] py-0.5 cursor-pointer">
          <input type="checkbox" checked={!!checks[f.key]} onChange={() => toggle(f.key)} className="w-3.5 h-3.5" />{f.label}
        </label>
      ))}
      <div className="mt-4 text-center">
        <div className="font-data text-3xl font-bold" style={{ color: total >= 3 ? 'var(--color-error)' : 'var(--color-primary)' }}>{total}</div>
        <div className="text-sm mt-1 text-[var(--color-text-secondary)]">{risk}</div>
        <div className="text-xs text-[var(--color-text-muted)] mt-1">≥3分提示高出血风险</div>
        <TagBtn label="HASBLED" value={String(total)} onTagSave={onTagSave} />
      </div>
    </Card>
  );
}
