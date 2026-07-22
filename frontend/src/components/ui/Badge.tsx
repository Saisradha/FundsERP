import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  success: 'chip-success',
  warning: 'chip-warning',
  danger: 'chip-danger',
  info: 'chip-primary',
  neutral: '',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
}) => {
  const neutralStyle = variant === 'neutral'
    ? { background: 'var(--color-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }
    : {};

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${variantMap[variant]} ${className}`}
      style={neutralStyle}
    >
      {children}
    </span>
  );
};
