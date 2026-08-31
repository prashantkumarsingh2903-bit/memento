import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'elevated' | 'interactive' | 'accent';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-warm-card border border-warm-border shadow-subtle',
    subtle: 'bg-warm-card-subtle/70 border border-warm-border/60',
    elevated: 'bg-warm-card border border-warm-border/80 shadow-soft',
    interactive:
      'bg-warm-card border border-warm-border shadow-subtle hover:border-warm-border-strong hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
    accent:
      'bg-warm-accent-light/40 border border-warm-accent/25 shadow-subtle',
  };

  return (
    <div
      className={`rounded-2xl p-5 ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
