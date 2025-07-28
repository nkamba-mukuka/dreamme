import React from 'react';
import { cn } from '../../lib/utils';

export interface InputBaseProps {
    variant?: 'default' | 'filled' | 'outline';
    inputSize?: 'sm' | 'md' | 'lg';
    error?: boolean;
    helperText?: string;
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, InputBaseProps { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant = 'default', inputSize = 'md', error, helperText, ...props }, ref) => {
        const variants = {
            default: 'bg-white/10 border border-white/20',
            filled: 'bg-white/20 border-transparent',
            outline: 'bg-transparent border-2 border-white/20'
        };

        const sizes = {
            sm: 'h-9 px-3 text-sm',
            md: 'h-11 px-4 text-base',
            lg: 'h-12 px-6 text-lg'
        };

        return (
            <div className="space-y-1">
                <input
                    ref={ref}
                    className={cn(
                        'w-full rounded-lg text-white placeholder-white/50',
                        'focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-colors duration-200',
                        variants[variant],
                        sizes[inputSize],
                        error && 'border-red-500 focus:ring-red-500/30',
                        className
                    )}
                    {...props}
                />
                {helperText && (
                    <p className={cn(
                        'text-sm',
                        error ? 'text-red-400' : 'text-white/60'
                    )}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
); 