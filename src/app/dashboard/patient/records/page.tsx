'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Search, Filter, Calendar as CalendarIcon, SlidersHorizontal, Plus } from 'lucide-react';
import { RecordCard } from '@/components/patient/RecordCard';
import { UploadRecordModal } from '@/components/records/UploadRecordModal';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

interface Record {
    id: string;
    title: string;
    date: string;
    type: string;
    category?: string;
    status?: 'normal' | 'attention' | 'critical' | 'completed';
}

import { RecordDetailsDialog } from '@/components/records/RecordDetailsDialog';

export default function MedicalRecordsPage() {
    const { user } = useAuth();
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!user) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('medical_records')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (!error && data) {
                // Map DB records to UI model
                const mappedRecords = data.map((r: any) => {
                    // Simple heuristic for status - random or based on future analysis
                    // consistent based on ID char for demo stability
                    const statusOptions = ['completed', 'normal', 'attention'] as const;
                    const status = statusOptions[r.id.charCodeAt(0) % 3];

                    return {
                        id: r.id,
                        title: r.record_type === 'lab_test' ? `${r.test_name}` : `Prescription`,
                        date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        type: r.record_type === 'lab_test' ? 'Lab Result' : 'Prescription',
                        category: r.test_category || (r.record_type === 'prescription' ? 'Medication' : 'General'),
                        status: status,
                        // Pass raw data for dialog
                        test_results: r.test_results,
                        prescription_text: r.prescription_text,
                        doctor_name: r.doctor_name,
                        description: r.description
                    }
                });
                setRecords(mappedRecords);
            }
            setLoading(false);
        };

        fetchRecords();
    }, [user, refreshTrigger]);

    const filteredRecords = records.filter(r =>
        (activeFilter === 'All' || r.type === activeFilter || r.category === activeFilter) &&
        (r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.type.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                >
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                        Medical Records
                    </h1>
                    <p className="text-muted-foreground text-base max-w-lg">
                        Centralized vault for all your health documents, lab results, and prescriptions.
                    </p>
                </motion.div>

                <div className="flex gap-3">
                    <UploadRecordModal onRecordAdded={() => setRefreshTrigger(prev => prev + 1)}>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-xl h-12 px-6 transition-all duration-300 hover:scale-105 active:scale-95">
                            <Plus className="h-5 w-5 mr-2" />
                            Upload Record
                        </Button>
                    </UploadRecordModal>
                </div>
            </div>

            {/* Controls Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <GlassCard className="p-2 flex flex-col md:flex-row gap-4 items-center bg-white/60 backdrop-blur-xl border-white/40">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by name, doctor, or type..."
                            className="pl-12 bg-white/40 border-transparent hover:border-blue-200 focus:border-blue-400 focus:bg-white h-12 rounded-xl transition-all text-base"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto w-full md:w-auto flex items-center gap-2 pb-2 md:pb-0 scrollbar-hide">
                        {['All', 'Lab Result', 'Prescription', 'Imaging'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                                    : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden md:block" />

                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:w-auto border-slate-200 text-slate-600 hover:bg-white h-12 rounded-xl">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Date
                        </Button>
                        <Button variant="outline" className="flex-1 md:w-auto border-slate-200 text-slate-600 hover:bg-white h-12 rounded-xl">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Records Grid */}
            <AnimatePresence mode='wait'>
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="relative">
                            <LoadingSpinner size={48} className="text-blue-500" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-8 w-8 rounded-full bg-blue-50" />
                            </div>
                        </div>
                        <p className="mt-4 text-slate-400 font-medium">Loading your secure records...</p>
                    </motion.div>
                ) : filteredRecords.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-full"
                    >
                        <GlassCard className="flex flex-col items-center justify-center py-24 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
                            <div className="h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center mb-6 shadow-inner">
                                <Upload className="h-10 w-10 text-blue-400 opacity-80" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No records found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8">
                                {search ? `No results matching "${search}"` : "Upload your first medical record to start tracking your health journey."}
                            </p>
                            {!search && (
                                <UploadRecordModal onRecordAdded={() => setRefreshTrigger(prev => prev + 1)}>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-8 shadow-lg shadow-blue-500/20">
                                        Upload Now
                                    </Button>
                                </UploadRecordModal>
                            )}
                        </GlassCard>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredRecords.map((record, index) => (
                            <motion.div
                                key={record.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <RecordCard
                                    title={record.title}
                                    date={record.date}
                                    type={record.type}
                                    category={record.category}
                                    status={record.status}
                                    onView={() => setSelectedRecord(record)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <RecordDetailsDialog
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                record={selectedRecord}
            />
        </div>
    );
}
