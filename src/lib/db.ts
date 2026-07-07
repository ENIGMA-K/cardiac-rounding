import Dexie, { type Table } from 'dexie';
import type { Patient, RoundingRecord, LabResult, OCRRecord, CalcHistory } from '@/types';

export class CardiacDB extends Dexie {
  patients!: Table<Patient, string>;
  roundingRecords!: Table<RoundingRecord, string>;
  labResults!: Table<LabResult, string>;
  ocrRecords!: Table<OCRRecord, string>;
  calcHistory!: Table<CalcHistory, string>;
  settings!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('CardiacRoundingDB');
    this.version(2).stores({
      patients: 'id, phase, archived, admissionDate, attendingDoctor, name',
      roundingRecords: 'id, patientId, phase, session, status, createdAt',
      labResults: 'id, patientId, date, source',
      ocrRecords: 'id, patientId, createdAt',
      calcHistory: 'id, calculatorType, patientId, createdAt',
      settings: 'key',
    });
  }
}

export const db = new CardiacDB();

export async function exportAllData(): Promise<string> {
  const data = {
    app: 'cardiac-rounding', version: '1.0.0',
    exportedAt: new Date().toISOString(),
    patients: await db.patients.toArray(),
    roundingRecords: await db.roundingRecords.toArray(),
    labResults: await db.labResults.toArray(),
    ocrRecords: await db.ocrRecords.toArray(),
    calcHistory: await db.calcHistory.toArray(),
  };
  return JSON.stringify(data, null, 2);
}

export async function importAllData(json: string): Promise<void> {
  const data = JSON.parse(json);
  if (!data.app || !data.version) throw new Error('无效的备份文件格式');
  await db.transaction('rw',
    [db.patients, db.roundingRecords, db.labResults, db.ocrRecords, db.calcHistory],
    async () => {
      await Promise.all([
        db.patients.clear(), db.roundingRecords.clear(), db.labResults.clear(),
        db.ocrRecords.clear(), db.calcHistory.clear(),
      ]);
      if (data.patients) await db.patients.bulkAdd(data.patients);
      if (data.roundingRecords) await db.roundingRecords.bulkAdd(data.roundingRecords);
      if (data.labResults) await db.labResults.bulkAdd(data.labResults);
      if (data.ocrRecords) await db.ocrRecords.bulkAdd(data.ocrRecords);
      if (data.calcHistory) await db.calcHistory.bulkAdd(data.calcHistory);
    }
  );
}

export async function getSetting(key: string): Promise<unknown> {
  const s = await db.settings.get(key);
  return s?.value;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}
