import { create } from 'zustand';
import { v4 as uid } from 'uuid';
import type { Patient, PatientFilters, ClinicalPhase, SurgeryInfo } from '@/types';
import { db } from '@/lib/db';

export interface PatientFormData {
  name: string; gender: 'male' | 'female'; age: number; mrn: string;
  bedNumber: string; diagnosis: string; comorbidities: string[];
  admissionDate: string; surgeryDate?: string; dischargeDate?: string;
  phase: ClinicalPhase; attendingDoctor: string; surgery?: SurgeryInfo;
  tubes: import('@/types').TubeInfo[]; tags: string[]; notes: string;
  phaseHistory: import('@/types').PhaseChange[];
}

interface PatientState {
  patients: Patient[]; loading: boolean; error: string | null;
  fetchPatients: (filters?: PatientFilters) => Promise<void>;
  getPatient: (id: string) => Promise<Patient | undefined>;
  addPatient: (data: PatientFormData) => Promise<Patient>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  archivePatient: (id: string) => Promise<void>;
  transitionPhase: (id: string, newPhase: ClinicalPhase) => Promise<void>;
  getAllTags: () => string[];
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [], loading: false, error: null,

  fetchPatients: async (filters) => {
    set({ loading: true, error: null });
    try {
      let patients = await db.patients.orderBy('admissionDate').reverse().toArray();
      if (filters?.phase) patients = patients.filter((p) => p.phase === filters.phase);
      if (!filters?.showArchived && !filters?.phase) patients = patients.filter((p) => !p.archived);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        patients = patients.filter((p) => p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q) || p.bedNumber?.includes(q));
      }
      if (filters?.tag) patients = patients.filter((p) => p.tags.includes(filters.tag!));
      set({ patients, loading: false });
    } catch (e) { set({ error: (e as Error).message, loading: false }); }
  },

  getPatient: (id) => db.patients.get(id),

  addPatient: async (data) => {
    const now = new Date().toISOString();
    const { tubes, ...rest } = data;
    const patient: Patient = { id: uid(), ...rest, tubes: tubes || [], phaseHistory: [{ phase: data.phase, date: data.admissionDate || now.split('T')[0] }], archived: false, createdAt: now, updatedAt: now };
    await db.patients.add(patient);
    await get().fetchPatients();
    return patient;
  },

  updatePatient: async (id, data) => { await db.patients.update(id, { ...data, updatedAt: new Date().toISOString() }); await get().fetchPatients(); },
  deletePatient: async (id) => {
    await db.transaction('rw', [db.patients, db.roundingRecords, db.labResults], async () => {
      await db.patients.delete(id);
      await db.roundingRecords.where('patientId').equals(id).delete();
      await db.labResults.where('patientId').equals(id).delete();
    });
    await get().fetchPatients();
  },
  archivePatient: async (id) => {
    await db.patients.update(id, { archived: true, phase: 'discharged', dischargeDate: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString() });
    await get().fetchPatients();
  },
  transitionPhase: async (id, newPhase) => {
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    const patient = get().patients.find((p) => p.id === id);
    const update: Partial<Patient> = { phase: newPhase, updatedAt: now };
    if (newPhase === 'surgery-day' && !patient?.surgeryDate) update.surgeryDate = today;
    if (newPhase === 'discharged') update.dischargeDate = today;
    // Append to phase history
    const history = [...(patient?.phaseHistory || []), { phase: newPhase, date: today }];
    update.phaseHistory = history;
    await db.patients.update(id, update);
    await get().fetchPatients();
  },
  getAllTags: () => { const tags = new Set<string>(); get().patients.forEach((p) => p.tags.forEach((t) => tags.add(t))); return Array.from(tags).sort(); },
}));
