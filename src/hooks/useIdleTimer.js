import { useEffect, useRef } from 'react';
export function useIdleTimer(timeoutMinutes, onIdle, isActive) {
    const timerRef = useRef(null);
    useEffect(() => {
        if (!isActive)
            return;
        const reset = () => { if (timerRef.current)
            clearTimeout(timerRef.current); timerRef.current = setTimeout(onIdle, timeoutMinutes * 60 * 1000); };
        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach((e) => window.addEventListener(e, reset));
        reset();
        return () => { if (timerRef.current)
            clearTimeout(timerRef.current); events.forEach((e) => window.removeEventListener(e, reset)); };
    }, [timeoutMinutes, onIdle, isActive]);
}
