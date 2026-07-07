import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode; hoverable?: boolean; glow?: boolean;
}

export function Card({ children, hoverable, glow, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] ${glow ? 'card-glow' : ''} ${hoverable ? 'hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-focus)] transition-colors cursor-pointer' : ''} ${className}`}
      {...props}
    >{children}</div>
  );
}
