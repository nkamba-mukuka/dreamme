import React from 'react';
import { cn } from '../../lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    icon?: React.ReactNode;
    onClose?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = 'info', title, icon, onClose, children, ...props }, ref) => {
        const variants = {
            info: 'bg-blue-500/10 text-blue-200 border border-blue-500/20',
            success: 'bg-green-500/10 text-green-200 border border-green-500/20',
            warning: 'bg-yellow-500/10 text-yellow-200 border border-yellow-500/20',
            error: 'bg-red-500/10 text-red-200 border border-red-500/20'
        };

        return (
            <div
                ref={ref}
                role="alert"
                className={cn(
                    'rounded-lg p-4 backdrop-blur-sm',
                    variants[variant],
                    className
                )}
                {...props}
            >
                <div className="flex items-start gap-3">
                    {icon && (
                        <span className="flex-shrink-0 w-5 h-5">
                            {icon}
                        </span>
                    )}
                    <div className="flex-1">
                        {title && (
                            <h5 className="font-medium mb-1">{title}</h5>
                        )}
                        <div className="text-sm opacity-90">
                            {children}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                            aria-label="Close alert"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        );
    }
); 