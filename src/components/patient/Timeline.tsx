'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { Stethoscope, Activity, FileText, AlertCircle, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface TimelineEvent {
    id: string;
    date: string;
    rawDate: Date;
    title: string;
    type: 'checkup' | 'lab' | 'vital' | 'diagnosis';
    description: string;
    doctor?: string;
    clinic?: string;
    isAbnormal?: boolean;
}

const iconMap = {
    checkup: Stethoscope,
    lab: FileText,
    vital: Activity,
    diagnosis: AlertCircle,
};

const getGradient = (type: string) => {
    switch (type) {
        case 'checkup': return 'from-blue-500 to-indigo-500';
        case 'lab': return 'from-purple-500 to-fuchsia-500';
        case 'vital': return 'from-teal-400 to-emerald-500';
        case 'diagnosis': return 'from-amber-400 to-orange-500';
        default: return 'from-slate-500 to-slate-600';
    }
};

const getGlow = (type: string) => {
    switch (type) {
        case 'checkup': return 'shadow-blue-500/30';
        case 'lab': return 'shadow-purple-500/30';
        case 'vital': return 'shadow-teal-500/30';
        case 'diagnosis': return 'shadow-amber-500/30';
        default: return 'shadow-slate-500/30';
    }
};

export function Timeline() {
    const { user } = useAuth();
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Fetch Appointments (Treat as 'checkup')
                const { data: appointments, error: aptError } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        doctor:profiles!doctor_id(full_name, specialization, hospital_name)
                    `)
                    .eq('patient_id', user.id)
                    .in('status', ['completed', 'confirmed']); // Only show completed or confirmed future

                if (aptError) console.warn('Error fetching appointments:', aptError);

                // Fetch Medical Records
                const { data: records, error: recordError } = await supabase
                    .from('medical_records')
                    .select('*')
                    .eq('user_id', user.id);

                if (recordError) console.warn('Error fetching records:', recordError);

                // Map Appointments to TimelineEvents
                const aptEvents: TimelineEvent[] = (appointments || []).map((apt: any) => ({
                    id: `apt-${apt.id}`,
                    date: format(new Date(apt.appointment_date), 'MMM d, yyyy'),
                    rawDate: new Date(apt.appointment_date),
                    title: apt.doctor ? `Appointment with Dr. ${apt.doctor.full_name}` : 'Medical Appointment',
                    type: 'checkup',
                    description: apt.reason || 'Routine consultation',
                    doctor: apt.doctor ? `Dr. ${apt.doctor.full_name}` : undefined,
                    clinic: apt.doctor?.hospital_name,
                    isAbnormal: false
                }));

                // Map Records to TimelineEvents
                const recordEvents: TimelineEvent[] = (records || []).map((rec: any) => {
                    let type: TimelineEvent['type'] = 'lab';
                    if (rec.record_type === 'prescription') type = 'diagnosis';
                    else if (rec.record_type === 'lab_test') type = 'lab';
                    // We can map other types as needed

                    return {
                        id: `rec-${rec.id}`,
                        date: format(new Date(rec.date), 'MMM d, yyyy'),
                        rawDate: new Date(rec.date),
                        title: rec.test_name || 'Medical Record',
                        type: type,
                        description: `Uploaded ${rec.record_type.replace('_', ' ')}`,
                        clinic: rec.hospital_name, // If available in record
                        isAbnormal: false // We'd need to parse results to truly know this
                    };
                });

                // Combine and Sort
                const allEvents = [...aptEvents, ...recordEvents].sort((a, b) =>
                    b.rawDate.getTime() - a.rawDate.getTime()
                );

                setEvents(allEvents);

            } catch (error) {
                console.error("Error building timeline:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="relative max-w-4xl mx-auto py-10 space-y-12">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-8 animate-pulse">
                        <div className="w-1/2 flex justify-end"><div className="h-4 w-24 bg-slate-200 rounded"></div></div>
                        <div className="h-4 w-4 rounded-full bg-slate-200"></div>
                        <div className="w-1/2"><div className="h-32 w-full bg-slate-100 rounded-xl"></div></div>
                    </div>
                ))}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No timeline events yet</h3>
                <p className="text-slate-500">Events will appear here as you book appointments or upload records.</p>
            </div>
        );
    }

    return (
        <div className="relative max-w-4xl mx-auto pl-4 md:pl-0">
            {/* Central Rail (Desktop) / Left Rail (Mobile) */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400/0 via-blue-400/50 to-purple-400/0 md:-ml-[1px]" />

            <div className="space-y-12 py-10">
                {events.map((event, index) => {
                    const Icon = iconMap[event.type];
                    const isEven = index % 2 === 0;

                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn(
                                "relative flex items-center md:justify-between px-4 md:px-0",
                                isEven ? "md:flex-row-reverse" : "md:flex-row"
                            )}
                        >
                            {/* Mobile Rail Node Connector */}
                            <div className="absolute left-8 md:left-1/2 w-4 md:w-8 h-[2px] bg-blue-300/50 -ml-2 md:ml-0 md:-translate-x-1/2 z-0" />

                            {/* Center Node */}
                            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                                <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    className={cn(
                                        "h-4 w-4 rounded-full border-[3px] border-white shadow-lg bg-gradient-to-br",
                                        getGradient(event.type),
                                        getGlow(event.type)
                                    )}
                                >
                                    {event.isAbnormal && (
                                        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                                    )}
                                </motion.div>
                            </div>

                            {/* Content Card */}
                            <div className={cn(
                                "w-full md:w-[45%] ml-12 md:ml-0 group",
                                isEven ? "text-left" : "text-left md:text-right"
                            )}>
                                {/* Date Label */}
                                <div className={cn(
                                    "flex items-center gap-2 mb-2 text-sm font-medium text-slate-500",
                                    isEven ? "justify-start" : "justify-start md:justify-end"
                                )}>
                                    <Calendar className="h-4 w-4 opacity-70" />
                                    {event.date}
                                </div>

                                <GlassCard className="p-0 overflow-hidden hover:scale-[1.02] transition-transform duration-300 border-white/50 shadow-sm hover:shadow-xl bg-white/60 backdrop-blur-md">
                                    <div className="relative p-5">
                                        {/* Color Accent Bar */}
                                        <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", getGradient(event.type))} />

                                        <div className={cn("flex flex-col gap-1", isEven ? "items-start" : "items-start md:items-end")}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border",
                                                    event.type === 'checkup' && "bg-blue-50 text-blue-600 border-blue-100",
                                                    event.type === 'lab' && "bg-purple-50 text-purple-600 border-purple-100",
                                                    event.type === 'diagnosis' && "bg-amber-50 text-amber-600 border-amber-100",
                                                    event.type === 'vital' && "bg-teal-50 text-teal-600 border-teal-100",
                                                )}>
                                                    {event.type}
                                                </span>
                                                {event.isAbnormal && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                                        <AlertCircle className="h-3 w-3" /> Attention
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                                {event.title}
                                            </h3>

                                            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                                                {event.description}
                                            </p>

                                            <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs text-slate-400">
                                                <span>{event.clinic || event.doctor}</span>
                                                {event.doctor && <span className="font-medium text-slate-500">{event.doctor}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Empty space for opposite side */}
                            <div className="hidden md:block w-[45%]" />
                        </motion.div>
                    );
                })}

                {/* End of Journey Indicator */}
                <div className="relative flex justify-center py-8">
                    <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-400 text-xs font-medium uppercase tracking-widest border border-slate-200">
                        Start of Records
                    </div>
                </div>
            </div>
        </div>
    );
}
