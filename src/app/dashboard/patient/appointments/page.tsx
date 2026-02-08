'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Calendar, Clock, MapPin, Video, CheckCircle2, XCircle, AlertCircle, ArrowRight, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';

export default function AppointmentsPage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        doctor:profiles!doctor_id(full_name, specialization, hospital_name)
                    `)
                    .eq('patient_id', user.id)
                    .order('appointment_date', { ascending: true });

                if (error) throw error;
                setAppointments(data || []);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [user]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return CheckCircle2;
            case 'completed': return CheckCircle2;
            case 'cancelled': return XCircle;
            default: return AlertCircle;
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">My Appointments</h1>
                    <p className="text-slate-500 mt-1">Manage your upcoming visits and past consultations.</p>
                </div>
                <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 rounded-xl">
                    + New Appointment
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="h-48 rounded-3xl bg-white/40 animate-pulse border border-white/40" />
                    ))}
                </div>
            ) : appointments.length === 0 ? (
                <GlassCard className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <Calendar className="h-10 w-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No appointments scheduled</h3>
                    <p className="text-slate-500 max-w-sm mb-6">You don&apos;t have any upcoming appointments. Find a specialist to book your first visit.</p>
                    <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                        Find a Doctor
                    </Button>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {appointments.map((apt, index) => {
                            const StatusIcon = getStatusIcon(apt.status);
                            const dateObj = new Date(apt.appointment_date);
                            const isUpcoming = dateObj > new Date() && apt.status !== 'cancelled';

                            return (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <GlassCard className="group p-0 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 border-white/60">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Date Block */}
                                            <div className="w-full md:w-32 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 p-6 flex flex-row md:flex-col items-center justify-center gap-1 md:gap-0 text-center">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{format(dateObj, 'MMM')}</span>
                                                <span className="text-2xl md:text-3xl font-bold text-slate-800">{format(dateObj, 'd')}</span>
                                                <span className="text-sm font-medium text-slate-500">{format(dateObj, 'EEE')}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                <div className="flex items-start gap-4">
                                                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                                                        <AvatarImage src={`/placeholder-doctor.jpg`} />
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-indigo-600 font-bold">
                                                            {apt.doctor?.full_name?.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="font-bold text-lg text-slate-800">
                                                                {apt.doctor?.full_name ? `Dr. ${apt.doctor.full_name}` : 'Unknown Doctor'}
                                                            </h3>
                                                            <div className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border flex items-center gap-1 ${getStatusStyle(apt.status)}`}>
                                                                <StatusIcon className="h-3 w-3" />
                                                                {apt.status}
                                                            </div>
                                                        </div>

                                                        <p className="text-sm font-medium text-indigo-600">
                                                            {apt.doctor?.specialization || 'General Practice'}
                                                        </p>

                                                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {format(dateObj, 'h:mm a')}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                {apt.doctor?.hospital_name || 'Online Consultation'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                    {isUpcoming ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 md:flex-none border-slate-200 hover:bg-slate-50 rounded-xl"
                                                                onClick={() => toast.info('Rescheduling is not yet available.')}
                                                            >
                                                                Reschedule
                                                            </Button>
                                                            <Button
                                                                className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 rounded-xl gap-2"
                                                                onClick={() => toast.info('Video consultation feature coming soon!')}
                                                            >
                                                                <Video className="h-4 w-4" />
                                                                Join Call
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button variant="ghost" className="ml-auto text-slate-400 hover:text-slate-600">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
