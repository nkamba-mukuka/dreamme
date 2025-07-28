import React from 'react';
import { cn } from '../../lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    center?: boolean;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
    ({ className, size = 'lg', padding = 'md', center = true, children, ...props }, ref) => {
        const sizes = {
            sm: 'w-full max-w-screen-sm',
            md: 'w-full max-w-screen-md',
            lg: 'w-full max-w-screen-lg',
            xl: 'w-full max-w-screen-xl',
            full: 'w-full'
        };

        const paddings = {
            none: 'px-0',
            sm: 'px-3 sm:px-4',
            md: 'px-4 sm:px-6 lg:px-8',
            lg: 'px-4 sm:px-8 lg:px-12'
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'box-border',
                    sizes[size],
                    paddings[padding],
                    center && 'mx-auto',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
); 