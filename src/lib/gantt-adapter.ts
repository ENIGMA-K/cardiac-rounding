import type { Patient, ClinicalPhase } from '@/types';

export interface GanttTask {
  phase: ClinicalPhase; label: string; color: string;
  startDate: Date; endDate: Date;
}

const phaseColorMap: Record<ClinicalPhase, string> = {
  'pre-op': '#94a3b8', 'surgery-day': '#f87171', 'post-op-icu': '#fb923c',
  'post-op-ward-monitor': '#fbbf24', 'post-op-ward': '#4ade80',
  'transfer': '#60a5fa', 'discharged': '#6b7280',
};

const phaseLabels: Record<ClinicalPhase, string> = {
  'pre-op': '术前', 'surgery-day': '手术日', 'post-op-icu': '术后监护',
  'post-op-ward-monitor': '病房监护', 'post-op-ward': '术后病房',
  'transfer': '转出', 'discharged': '已出院',
};

export function getPhaseColor(phase: ClinicalPhase): string { return phaseColorMap[phase] || '#94a3b8'; }
export function getPhaseLabel(phase: ClinicalPhase): string { return phaseLabels[phase] || phase; }
export { phaseColorMap, phaseLabels };

export function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
export function dateStr(d: Date): string { return d.toISOString().slice(0,10); }
export function sameDay(a: Date, b: Date): boolean { return dateStr(a) === dateStr(b); }

/** Get day-by-day phases for dot rendering */
export function getPatientDays(patient: Patient, today: Date): { phase: ClinicalPhase; date: Date; isToday: boolean }[] {
  if (!patient.admissionDate) return [];
  const admission = new Date(patient.admissionDate + 'T00:00:00');
  const start = new Date(admission);
  const surgeryDay = patient.surgeryDate ? new Date(patient.surgeryDate + 'T00:00:00') : null;
  const totalDays = Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
  const history = (patient.phaseHistory || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const result: { phase: ClinicalPhase; date: Date; isToday: boolean }[] = [];

  for (let i = 0; i < totalDays; i++) {
    const d = addDays(start, i);
    const isToday = dateStr(d) === dateStr(today);
    const dStr = dateStr(d);
    let phase: ClinicalPhase;

    if (surgeryDay && d >= surgeryDay) {
      if (sameDay(d, surgeryDay)) {
        phase = 'surgery-day';
      } else {
        let found: ClinicalPhase | null = null;
        for (let h = history.length - 1; h >= 0; h--) {
          if (history[h].date <= dStr) { found = history[h].phase; break; }
        }
        if (found && found !== 'pre-op' && found !== 'surgery-day') {
          phase = found;
        } else {
          phase = 'post-op-icu';
        }
      }
    } else {
      let found: ClinicalPhase | null = null;
      for (let h = history.length - 1; h >= 0; h--) {
        if (history[h].date <= dStr) { found = history[h].phase; break; }
      }
      phase = found || 'pre-op';
    }
    result.push({ phase, date: new Date(d), isToday });
  }
  return result;
}

export function patientToGanttTasks(patient: Patient, today: Date): GanttTask[] {
  if (!patient.admissionDate) return [];

  const admission = new Date(patient.admissionDate + 'T00:00:00');
  const start = new Date(admission);
  const end = today;

  if (start > end) return [];

  const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
  const days: ClinicalPhase[] = [];
  let surgeryDay: Date | null = patient.surgeryDate ? new Date(patient.surgeryDate + 'T00:00:00') : null;

  // Build a map of date -> phase from phaseHistory
  const history = (patient.phaseHistory || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 0; i < totalDays; i++) {
    const d = addDays(start, i);
    const dStr = dateStr(d);
    // Surgery day rule: always surgery-day
    if (surgeryDay && sameDay(d, surgeryDay)) {
      days.push('surgery-day');
      continue;
    }
    // Post-surgery but before first phase history entry: default to post-op-icu
    if (surgeryDay && d > surgeryDay) {
      // Find the phase that was active on this date from history
      let phaseForDay: ClinicalPhase | null = null;
      for (let h = history.length - 1; h >= 0; h--) {
        if (history[h].date <= dStr) { phaseForDay = history[h].phase; break; }
      }
      if (phaseForDay) {
        // Don't use pre-op or surgery-day for post-surgery days
        if (phaseForDay === 'pre-op' || phaseForDay === 'surgery-day') {
          days.push('post-op-icu');
        } else {
          days.push(phaseForDay);
        }
      } else {
        days.push('post-op-icu');
      }
    } else {
      // Pre-surgery or no surgery: use phase history or default to pre-op
      let phaseForDay: ClinicalPhase | null = null;
      for (let h = history.length - 1; h >= 0; h--) {
        if (history[h].date <= dStr) { phaseForDay = history[h].phase; break; }
      }
      days.push(phaseForDay || 'pre-op');
    }
  }

  const tasks: GanttTask[] = [];
  if (days.length === 0) return [];
  let currentPhase = days[0];
  let phaseStart = addDays(start, 0);
  for (let i = 1; i <= days.length; i++) {
    if (i === days.length || days[i] !== currentPhase) {
      tasks.push({
        phase: currentPhase, label: phaseLabels[currentPhase],
        color: phaseColorMap[currentPhase],
        startDate: new Date(phaseStart),
        endDate: i < days.length ? addDays(start, i) : addDays(end, 1),
      });
      if (i < days.length) { currentPhase = days[i]; phaseStart = addDays(start, i); }
    }
  }
  return tasks;
}
