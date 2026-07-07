export type ClinicalPhase = 'pre-op' | 'surgery-day' | 'post-op-icu' | 'post-op-ward-monitor' | 'post-op-ward' | 'transfer' | 'discharged';
export type RoundingSession = 'am' | 'pm';
export type TubeType = 'cvc' | 'arterial-sheath' | 'pericardial-drain' | 'left-chest-tube' | 'right-chest-tube' | 'arrow-catheter' | 'pneumothorax-tube' | 'ett' | 'tracheostomy' | 'dressing';

export const PHASE_LABELS: Record<ClinicalPhase, string> = {
  'pre-op': '术前', 'surgery-day': '手术日', 'post-op-icu': '术后监护',
  'post-op-ward-monitor': '病房监护', 'post-op-ward': '术后病房', 'transfer': '转出', 'discharged': '已出院',
};

export const SESSION_LABELS: Record<RoundingSession, string> = {
  'am': '早查房', 'pm': '晚查房',
};

export const TUBE_LABELS: Record<TubeType, string> = {
  'cvc': '中心静脉导管', 'arterial-sheath': '动脉鞘管', 'pericardial-drain': '心包引流',
  'left-chest-tube': '左胸腔引流', 'right-chest-tube': '右胸腔引流', 'arrow-catheter': '胸穿Arrow管',
  'pneumothorax-tube': '气胸管', 'ett': '气管插管', 'tracheostomy': '气切管',
  'dressing': '换药',
};

export const PHASE_TRANSITIONS: Record<ClinicalPhase, { label: string; target: ClinicalPhase }[]> = {
  'pre-op': [{ label: '今日手术', target: 'surgery-day' }],
  'surgery-day': [{ label: '转入监护室', target: 'post-op-icu' }],
  'post-op-icu': [
    { label: '转入病房监护', target: 'post-op-ward-monitor' },
    { label: '转科/转院', target: 'transfer' },
  ],
  'post-op-ward-monitor': [
    { label: '转入术后病房', target: 'post-op-ward' },
    { label: '退回监护室', target: 'post-op-icu' },
    { label: '转科/转院', target: 'transfer' },
  ],
  'post-op-ward': [
    { label: '退回病房监护', target: 'post-op-ward-monitor' },
    { label: '转科/转院', target: 'transfer' },
    { label: '出院', target: 'discharged' },
  ],
  'transfer': [
    { label: '转入术后病房', target: 'post-op-ward' },
    { label: '出院', target: 'discharged' },
  ],
  'discharged': [],
};

export interface PhaseChange {
  phase: ClinicalPhase;
  date: string;
}

export interface Patient {
  id: string; name: string; gender: 'male' | 'female'; age: number;
  mrn: string; bedNumber: string; diagnosis: string; comorbidities: string[];
  admissionDate: string; surgeryDate?: string; dischargeDate?: string;
  phase: ClinicalPhase; phaseHistory: PhaseChange[];
  attendingDoctor: string; surgery?: SurgeryInfo;
  tubes: TubeInfo[]; tags: string[]; notes: string; archived: boolean;
  createdAt: string; updatedAt: string;
}

export interface SurgeryInfo {
  cathDate?: string; cathFindings?: string; cathApproach?: 'radial' | 'femoral';
  surgeryType: string; surgeryDetail?: string; ctffr?: CTFFR;
  cpbTime?: number; crossClampTime?: number; dhcaTime?: number;
  cmrLgeSegments?: number; intraopComplications?: string;
}

export interface CTFFR { lad?: number; lcx?: number; rca?: number; }

export interface TodoItem { id: string; text: string; done: boolean; }

export interface TubeInfo {
  id: string;
  type: TubeType;
  insertedAt: string;
  lastDressingAt?: string;
  removedAt?: string;
}

export interface RoundingRecord {
  id: string;
  patientId: string;
  phase: ClinicalPhase;
  pod: number;
  session: RoundingSession;
  detailsText?: string;
  labText?: string;
  todos: TodoItem[];
  status: 'draft' | 'completed';
  completedAt?: string;
  previousRecordId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  id: string; patientId: string; date: string; time?: string;
  cbc?: CBC; chemistry?: Chemistry; coagulation?: Coagulation; abg?: ABG;
  electrolytes?: Electrolytes; inflammation?: Inflammation;
  custom?: Record<string, { value: number; unit: string }>;
  source?: 'manual' | 'ocr'; ocrRecordId?: string; createdAt: string;
}
export interface CBC { hb?: number; hct?: number; wbc?: number; plt?: number; neutrophils?: number; }
export interface Chemistry { scr?: number; gfr?: number; glucose?: number; alt?: number; ast?: number; tbil?: number; bnp?: number; troponin?: number; }
export interface Coagulation { pt?: number; inr?: number; ptt?: number; fibrinogen?: number; }
export interface ABG { ph?: number; pao2?: number; paco2?: number; sao2?: number; hco3?: number; be?: number; lactate?: number; }
export interface Electrolytes { k?: number; na?: number; ca?: number; mg?: number; phosphate?: number; }
export interface Inflammation { pct?: number; crp?: number; }

export interface OCRRecord { id: string; patientId: string; imageData: string; thumbnail?: string; extractedItems: ExtractedItem[]; mappedLabResultId?: string; createdAt: string; }
export interface ExtractedItem { name: string; value: number; unit: string; confidence: number; mapped: boolean; }

export interface CalcHistory { id: string; calculatorType: string; patientId?: string; inputs: Record<string, number>; result: { value: number | string; interpretation: string }; createdAt: string; }
export interface CalculatorDef { id: string; name: string; category: string; inputs: CalculatorInputDef[]; compute: (inputs: Record<string, number>, ctx?: CalcContext) => CalcResult; interpretation?: (value: number) => string; }
export interface CalcContext { height?: number; weight?: number; bsa?: number; }
export interface CalculatorInputDef { key: string; label: string; type: 'number' | 'select'; unit?: string; options?: string[]; required?: boolean; defaultValue?: number; }
export interface CalcResult { value: number | string; interpretation: string; details?: Record<string, number>; }

export interface AppSettings { passwordHash?: string; passwordSalt?: string; autoLockMinutes?: number; }
export interface KnowledgeChunk { id: string; source: string; title: string; section: string; content: string; tags: string[]; }
export interface KnowledgeBase { version: string; builtAt: string; sourceVault: string; totalChunks: number; chunks: KnowledgeChunk[]; }
export interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
export interface PatientFilters { phase?: ClinicalPhase; search?: string; tag?: string; showArchived?: boolean; }
