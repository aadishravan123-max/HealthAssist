'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatsWidgetProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: string;
    color?: 'blue' | 'red' | 'purple' | 'orange' | 'emerald';
    className?: string;
    delay?: number;
}

export function StatsWidget({ icon, label, value, subValue, color = 'blue', className, delay = 0 }: StatsWidgetProps) {
    const colorMap = {
        blue: 'bg-blue-100 text-blue-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        emerald: 'bg-emerald-100 text-emerald-600',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={className}
        >
            <GlassCard className="p-5 flex items-center gap-4 border-white/40 bg-white/60 backdrop-blur-xl hover:bg-white/70 transition-colors">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm", colorMap[color])}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
                        {subValue && (
                            <span className="text-xs text-muted-foreground font-medium">{subValue}</span>
                        )}
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}
