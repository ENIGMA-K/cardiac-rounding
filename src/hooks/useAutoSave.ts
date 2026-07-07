import { useEffect, useRef } from 'react';

export function useAutoSave<T>(data: T, saveFn: (data: T) => Promise<void>, delayMs: number = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data); dataRef.current = data;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => { try { await saveFn(dataRef.current); } catch { /* silent */ } }, delayMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, saveFn, delayMs]);
}
