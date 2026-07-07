import { create } from 'zustand';
import type { AppSettings } from '@/types';
import { getSetting, setSetting } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/crypto';

interface SettingsState {
  settings: AppSettings;
  isUnlocked: boolean;
  password: string | null;
  loadSettings: () => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  verifyUserPassword: (password: string) => Promise<boolean>;
  lockSession: () => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

const DEFAULTS: AppSettings = { autoLockMinutes: 15 };

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...DEFAULTS }, isUnlocked: false, password: null,

  loadSettings: async () => {
    const s: AppSettings = { ...DEFAULTS };
    try {
      const h = await getSetting('passwordHash'); const sa = await getSetting('passwordSalt');
      const al = await getSetting('autoLockMinutes');
      if (h) s.passwordHash = h as string; if (sa) s.passwordSalt = sa as string;
      if (al) s.autoLockMinutes = al as number;
    } catch { /* first load */ }
    set({ settings: s });
  },

  setPassword: async (pw) => {
    const { hash, salt } = await hashPassword(pw);
    await setSetting('passwordHash', hash); await setSetting('passwordSalt', salt);
    set((st) => ({ settings: { ...st.settings, passwordHash: hash, passwordSalt: salt }, password: pw }));
  },

  verifyUserPassword: async (pw) => {
    const { settings } = get();
    if (!settings.passwordHash || !settings.passwordSalt) {
      await get().setPassword(pw); set({ isUnlocked: true, password: pw }); return true;
    }
    const ok = await verifyPassword(pw, settings.passwordHash, settings.passwordSalt);
    if (ok) set({ isUnlocked: true, password: pw });
    return ok;
  },

  lockSession: () => { set({ isUnlocked: false, password: null }); },

  updateSetting: async (k, v) => { await setSetting(k as string, v); set((st) => ({ settings: { ...st.settings, [k]: v } })); },
}));
