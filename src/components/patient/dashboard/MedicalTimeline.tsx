'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface TimelineEvent {
    id: string;
    title: string;
    date: string;
    status: 'completed' | 'upcoming' | 'attention';
    doctor?: string;
    type: string;
}

interface MedicalTimelineProps {
    events?: TimelineEvent[];
}

// Mock data if none provided
const defaultEvents: TimelineEvent[] = [
    { id: '1', title: 'Annual Cardiac Checkup', date: 'Today, 2:00 PM', status: 'upcoming', doctor: 'Dr. Sarah Smith', type: 'Appointment' },
    { id: '2', title: 'Blood Work Results', date: 'Yesterday', status: 'attention', type: 'Lab Result' },
    { id: '3', title: 'Prescription Renewal', date: 'Oct 24, 2024', status: 'completed', doctor: 'Dr. James Wilson', type: 'Medication' },
    { id: '4', title: 'Cardiology Consultation', date: 'Oct 10, 2024', status: 'completed', doctor: 'Dr. Sarah Smith', type: 'Visit' },
];

export function MedicalTimeline({ events = defaultEvents }: MedicalTimelineProps) {
    const getStatusColor = (status: TimelineEvent['status']) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500 shadow-emerald-500/50';
            case 'upcoming': return 'bg-blue-500 shadow-blue-500/50';
            case 'attention': return 'bg-amber-500 shadow-amber-500/50';
            default: return 'bg-slate-500';
        }
    };

    const getStatusIcon = (status: TimelineEvent['status']) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-3 w-3 text-white" />;
            case 'upcoming': return <Clock className="h-3 w-3 text-white" />;
            case 'attention': return <AlertCircle className="h-3 w-3 text-white" />;
        }
    };

    return (
        <div className="relative pl-4 space-y-8">
            {/* Vertical Glass Rail */}
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-200/50 via-purple-200/50 to-transparent" />

            {events.map((event, index) => (
                <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="relative pl-8 group"
                >
                    {/* Node */}
                    <div className={cn(
                        "absolute left-[1.15rem] top-1 h-3 w-3 rounded-full shadow-lg ring-4 ring-white/50 transition-all duration-300 group-hover:scale-125",
                        getStatusColor(event.status)
                    )} />

                    {/* Card */}
                    <div className="p-4 rounded-xl bg-white/40 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/60 cursor-default">
                        <div className="flex justify-between items-start mb-1">
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                event.status === 'upcoming' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    event.status === 'attention' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                            )}>
                                {event.status}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">{event.date}</span>
                        </div>

                        <h4 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {event.title}
                        </h4>

                        {event.doctor && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                {event.doctor}
                            </p>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
