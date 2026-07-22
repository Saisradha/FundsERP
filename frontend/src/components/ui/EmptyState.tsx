import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
    >
      {icon || <Inbox className="w-6 h-6" />}
    </div>
    <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
      {title}
    </h3>
    {description && (
      <p className="text-xs max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {description}
      </p>
    )}
    {actionLabel && onAction && (
      <div className="mt-4">
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    )}
  </div>
);

/* ================================================================
   Skeleton Loaders
   ================================================================ */
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`rounded-lg animate-skeleton ${className}`}
    style={{ background: 'var(--color-skeleton)' }}
  />
);

export const SkeletonCard: React.FC = () => (
  <div
    className="p-5 rounded-xl border space-y-3 animate-fade-in"
    style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}
  >
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-8 w-full rounded-full" />
  </div>
);

export const SkeletonTableRow: React.FC<{ cols?: number }> = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="p-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);
