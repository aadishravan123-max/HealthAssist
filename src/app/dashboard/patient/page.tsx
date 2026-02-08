'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Components
import { HeroSection } from '@/components/patient/dashboard/HeroSection';
import { MedicalTimeline } from '@/components/patient/dashboard/MedicalTimeline';
import { HealthInsightPanel } from '@/components/patient/HealthInsightPanel';
import { VitalsChart } from '@/components/patient/VitalsChart';
import { RecordCard } from '@/components/patient/RecordCard'; // Assuming this exists or will be used
import { ArrowRight, FileText, Activity } from 'lucide-react';

import { RecordDetailsDialog } from '@/components/records/RecordDetailsDialog';

export default function PatientDashboard() {
    const { user, profile } = useAuth();
    const [recentRecords, setRecentRecords] = useState<any[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // Fetch Recent Records
                const { data: records } = await supabase
                    .from('medical_records')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })
                    .limit(3);

                setRecentRecords(records || []);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Mock timeline events based on records or static for now
    // In real app, this would be transformed from real data
    const timelineEvents = [
        { id: '1', title: 'Cardiology Check-up', date: 'Today, 2:00 PM', status: 'upcoming' as const, doctor: 'Dr. Sarah Smith', type: 'Appointment' },
        { id: '2', title: 'Blood Work Results', date: 'Yesterday', status: 'attention' as const, type: 'Lab Result' },
        { id: '3', title: 'Prescription Refill', date: 'Oct 24, 2024', status: 'completed' as const, doctor: 'Dr. James Wilson', type: 'Medication' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 p-4 md:p-8 space-y-8">

            {/* 1. Hero Section with 3D Graphic & Key Stats */}
            <section className="w-full animate-in fade-in slide-in-from-top-4 duration-700">
                <HeroSection userName={profile?.full_name?.split(' ')[0] || 'Patient'} />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* 2. Main Content Column (Left/Center) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Vitals Chart Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Vitals Trends
                            </h2>
                            <select className="bg-white/50 border border-white/60 rounded-lg text-xs py-1 px-3 text-slate-600 focus:outline-none">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="glass-panel p-1 rounded-3xl overflow-hidden bg-white/40">
                            <VitalsChart />
                        </div>
                    </section>

                    {/* Medical Timeline Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl font-bold text-foreground">Health Journey</h2>
                            <button className="text-sm text-primary font-medium hover:underline">View Full History</button>
                        </div>
                        <div className="glass-panel p-6 md:p-8 rounded-3xl bg-white/40 min-h-[400px]">
                            <MedicalTimeline events={timelineEvents} />
                        </div>
                    </section>
                </div>

                {/* 3. Sidebar Column (Right) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* AI Insights - Primary Action */}
                    <section>
                        <HealthInsightPanel />
                    </section>

                    {/* Recent Documents / Records */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-bold text-foreground">Recent Documents</h2>
                            <Link href="/dashboard/patient/records" className="p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <ArrowRight className="h-4 w-4 text-slate-500" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentRecords.length === 0 ? (
                                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/30 text-slate-400">
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No recent records</p>
                                </div>
                            ) : (
                                recentRecords.map((r, i) => (
                                    <motion.div
                                        key={r.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <RecordCard
                                            title={r.record_type === 'lab_test' ? `${r.test_name}` : `Prescription`}
                                            date={new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            type={r.record_type === 'lab_test' ? 'Lab Result' : 'Prescription'}
                                            category={r.test_category || (r.record_type === 'prescription' ? 'Medication' : 'General')}
                                            onView={() => setSelectedRecord({
                                                ...r,
                                                title: r.record_type === 'lab_test' ? `${r.test_name}` : `Prescription`,
                                                type: r.record_type === 'lab_test' ? 'Lab Result' : 'Prescription',
                                                category: r.test_category || (r.record_type === 'prescription' ? 'Medication' : 'General')
                                            })}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <Link href="/dashboard/patient/records" className="block w-full">
                            <button className="w-full py-3 rounded-xl border border-slate-200 bg-white/40 hover:bg-white/60 text-sm font-medium text-slate-600 transition-all">
                                View sensitive records vaulted
                            </button>
                        </Link>
                    </section>
                </div>
            </div>

            <RecordDetailsDialog
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                record={selectedRecord}
            />
        </div>
    );
}
