import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'soft-accent' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2 font-medium',
    lg: 'text-base px-5 py-3 rounded-xl gap-2.5 font-semibold',
    icon: 'p-2.5 rounded-xl',
  };

  const variantStyles = {
    primary:
      'bg-[#6C4FF6] text-white hover:bg-[#5B3FD4] shadow-subtle hover:shadow-soft active:bg-[#5B3FD4]',
    secondary:
      'bg-white dark:bg-[#26252F] text-app-text hover:bg-app-surface-secondary border border-app-border shadow-subtle',
    outline:
      'bg-transparent text-app-text hover:bg-app-surface-secondary border border-app-border',
    ghost:
      'bg-transparent text-app-text-secondary hover:text-app-text hover:bg-[#F1EEFF]/60 dark:hover:bg-[#6C4FF6]/15',
    danger:
      'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800',
    'soft-accent':
      'bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] hover:bg-[#6C4FF6]/15 border border-[#6C4FF6]/20',
    gradient:
      'bg-gradient-to-r from-[#6C4FF6] via-[#D95CFF] to-[#48D7E8] text-white shadow-soft hover:opacity-95',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
