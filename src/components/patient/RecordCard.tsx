'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { FileText, Download, Share2, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RecordParams } from '@/components/patient/records/RecordParams';

interface RecordCardProps {
    title: string;
    date: string;
    type: string;
    category?: string;
    status?: 'normal' | 'attention' | 'critical' | 'completed';
    onView?: () => void;
}

export function RecordCard({ title, date, type, category, status, onView }: RecordCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="h-full"
        >
            <GlassCard className="h-full p-5 flex flex-col justify-between group bg-white/60 backdrop-blur-xl border-white/40 hover:border-blue-400/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-white/60 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-6 w-6" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2 -mt-2">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </div>

                <div className="mb-4">
                    <h4 className="font-bold text-foreground text-lg mb-1 leading-tight line-clamp-2" title={title}>
                        {title}
                    </h4>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
                        {date}
                    </p>

                    <RecordParams type={type} category={category || 'General'} status={status} />
                </div>

                <div className="pt-4 mt-auto border-t border-slate-100 flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white/50 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all font-medium text-xs h-9"
                        onClick={onView}
                    >
                        <Eye className="h-3.5 w-3.5 mr-2" />
                        View
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </GlassCard>
        </motion.div>
    );
}
