import { create } from 'zustand';
import { v4 as uid } from 'uuid';
import { db } from '@/lib/db';
export const useRoundingStore = create((set, get) => ({
    currentRecord: null, records: [], loading: false, dirty: false, error: null,
    createRecord: async (patientId, phase, session) => {
        const prevRecords = await db.roundingRecords
            .where('patientId').equals(patientId)
            .reverse().sortBy('createdAt');
        const prevRecord = prevRecords.length > 0 ? prevRecords[0] : null;
        const now = new Date().toISOString();
        const pod = phase === 'pre-op' || phase === 'discharged' ? 0 :
            phase === 'surgery-day' ? 0 :
                Math.max(1, Math.ceil((Date.now() - new Date(prevRecord?.createdAt || now).getTime()) / 86400000));
        const record = {
            id: uid(), patientId, phase, pod, session,
            labText: '', todos: [],
            status: 'draft', previousRecordId: prevRecord?.id,
            createdAt: now, updatedAt: now,
        };
        await db.roundingRecords.add(record);
        set({ currentRecord: record, dirty: false });
        return record;
    },
    loadRecord: async (recordId) => {
        const record = await db.roundingRecords.get(recordId);
        if (record)
            set({ currentRecord: record, dirty: false });
    },
    loadPatientRecords: async (patientId) => {
        const records = await db.roundingRecords.where('patientId').equals(patientId).reverse().sortBy('createdAt');
        set({ records });
    },
    setDetailsText: (text) => {
        set((state) => {
            if (!state.currentRecord)
                return state;
            return { currentRecord: { ...state.currentRecord, detailsText: text, updatedAt: new Date().toISOString() }, dirty: true };
        });
    },
    setLabText: (text) => {
        set((state) => {
            if (!state.currentRecord)
                return state;
            return { currentRecord: { ...state.currentRecord, labText: text, updatedAt: new Date().toISOString() }, dirty: true };
        });
    },
    setTodos: (todos) => {
        set((state) => {
            if (!state.currentRecord)
                return state;
            return { currentRecord: { ...state.currentRecord, todos, updatedAt: new Date().toISOString() }, dirty: true };
        });
    },
    saveDraft: async () => {
        const record = get().currentRecord;
        if (!record)
            return;
        const saved = { ...record, updatedAt: new Date().toISOString() };
        await db.roundingRecords.put(saved);
        set({ currentRecord: saved, dirty: false });
    },
    saveRecord: async (status = 'draft') => {
        const record = get().currentRecord;
        if (!record)
            return;
        const now = new Date().toISOString();
        const saved = {
            ...record, status, updatedAt: now,
            completedAt: status === 'completed' && !record.completedAt ? now : record.completedAt,
        };
        await db.roundingRecords.put(saved);
        set({ currentRecord: saved, dirty: false });
    },
}));
