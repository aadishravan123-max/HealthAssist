import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "glass-card rounded-xl p-6 border border-white/20 bg-white/60 backdrop-blur-md shadow-sm transition-all hover:shadow-md",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
