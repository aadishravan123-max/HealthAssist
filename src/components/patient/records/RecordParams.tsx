'use client';

import React from 'react';
import { cn } from '@/lib/utils';


interface RecordParamsProps {
    type: string;
    category: string;
    status?: 'normal' | 'attention' | 'critical' | 'completed';
}

export function RecordParams({ type, category, status = 'completed' }: RecordParamsProps) {

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'normal': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'attention': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'critical': return 'bg-red-500/10 text-red-600 border-red-500/20';
            default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        }
    };

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {type}
            </span>
            {category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    {category}
                </span>
            )}
            <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border uppercase tracking-wider",
                getStatusColor(status)
            )}>
                {status}
            </span>
        </div>
    );
}
