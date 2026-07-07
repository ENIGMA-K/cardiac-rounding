import { create } from 'zustand';
import { v4 as uid } from 'uuid';
import type { Toast } from '@/types';

export type ViewName = 'patients' | 'gantt' | 'todos' | 'calculators' | 'settings';
export type ModalData = Record<string, unknown>;

interface UIState {
  sidebarOpen: boolean; currentView: ViewName;
  activeModal: string | null; modalData: ModalData;
  previousModal: string | null; previousModalData: ModalData;
  toasts: Toast[];
  toggleSidebar: () => void; setView: (view: ViewName) => void;
  openModal: (name: string, data?: ModalData) => void;
  openSubModal: (name: string, data?: ModalData) => void;
  closeModal: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true, currentView: 'patients', activeModal: null, modalData: {}, previousModal: null, previousModalData: {}, toasts: [],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setView: (view) => set({ currentView: view }),

  openModal: (name, data) => set({ activeModal: name, modalData: data || {}, previousModal: null, previousModalData: {} }),

  openSubModal: (name, data) => {
    const { activeModal, modalData } = get();
    set({ previousModal: activeModal, previousModalData: modalData, activeModal: name, modalData: data || {} });
  },

  closeModal: () => {
    const { previousModal, previousModalData } = get();
    if (previousModal) set({ activeModal: previousModal, modalData: previousModalData, previousModal: null, previousModalData: {} });
    else set({ activeModal: null, modalData: {} });
  },

  addToast: (message, type) => { const id = uid(); set((s) => ({ toasts: [...s.toasts, { id, message, type }] })); setTimeout(() => get().removeToast(id), 3000); },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
