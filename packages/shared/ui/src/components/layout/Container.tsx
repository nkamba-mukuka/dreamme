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
            sm: 'max-w-screen-sm',
            md: 'max-w-screen-md',
            lg: 'max-w-screen-lg',
            xl: 'max-w-screen-xl',
            full: 'max-w-full'
        };

        const paddings = {
            none: 'px-0',
            sm: 'px-4',
            md: 'px-6',
            lg: 'px-8'
        };

        return (
            <div
                ref={ref}
                className={cn(
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