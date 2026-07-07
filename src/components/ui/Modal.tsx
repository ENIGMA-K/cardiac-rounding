import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean; onClose: () => void; title?: string;
  children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className={`bg-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] border border-[var(--color-border)] max-h-[90vh] overflow-y-auto ${size === 'sm' ? 'w-[480px]' : 'w-[720px] lg:w-[860px]'} max-w-[95vw]`} style={{ boxShadow: 'var(--shadow-elevated)' }} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)]">
            <h2 className="font-ui text-lg font-semibold text-[var(--color-text)]">{title}</h2>
            <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xl leading-none transition-colors">&times;</button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-3 border-t border-[var(--color-border)]">{footer}</div>}
      </div>
    </div>
  );
}
