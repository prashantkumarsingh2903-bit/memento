import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'elevated' | 'interactive' | 'accent' | 'gradient';
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
    default: 'bg-white dark:bg-[#201F28] border border-app-border shadow-subtle',
    subtle: 'bg-app-surface-secondary dark:bg-[#26252F] border border-app-border/70',
    elevated: 'bg-white dark:bg-[#201F28] border border-app-border shadow-soft',
    interactive:
      'bg-white dark:bg-[#201F28] border border-app-border shadow-subtle hover:border-[#6C4FF6]/40 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
    accent:
      'bg-[#F1EEFF] dark:bg-[#6C4FF6]/15 border border-[#6C4FF6]/25 shadow-subtle',
    gradient:
      'bg-gradient-to-br from-[#6C4FF6] via-[#D95CFF] to-[#48D7E8] text-white shadow-soft',
  };

  return (
    <div
      className={`rounded-card p-5 sm:p-6 ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
