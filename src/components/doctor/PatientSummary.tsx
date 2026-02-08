'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Clock, FileText, Upload } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Patient, MedicalRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/supabaseClient';
import { UploadPatientRecordModal } from './UploadPatientRecordModal';

interface PatientSummaryProps {
    patient: Patient | null;
}

export function PatientSummary({ patient }: PatientSummaryProps) {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!patient) return;
            const { data } = await supabase
                .from('medical_records')
                .select('*')
                .eq('user_id', patient.id)
                .order('date', { ascending: false });
            setRecords(data || []);
        };
        fetchRecords();
    }, [patient]);

    if (!patient) {
        return (
            <GlassCard className="h-full flex items-center justify-center text-muted-foreground p-8">
                Select a patient to view details
            </GlassCard>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <GlassCard className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="h-16 w-16 rounded-full bg-medical-primary/10 flex items-center justify-center text-2xl font-bold text-medical-primary">
                            {patient.full_name?.substring(0, 2).toUpperCase() || 'P'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{patient.full_name}</h2>
                            <p className="text-muted-foreground text-sm">Patient ID: #{patient.id.slice(0, 8)}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-3 w-3" /> Last Visit: {patient.lastVisit || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">History</Button>
                        <Button onClick={() => setIsUploadModalOpen(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Record
                        </Button>
                    </div>
                </div>
            </GlassCard>

            {/* Content Grid */}
            <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Left: Vitals & Status */}
                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-medical-primary" />
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {/* Placeholder for now */}
                            <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                                <p className="text-sm font-medium text-green-700">Stable Condition</p>
                                <p className="text-xs text-green-600 mt-1">Vitals are within normal range</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Right: Records */}
                <GlassCard className="p-6 flex flex-col">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-medical-primary" />
                        Medical Records
                    </h3>
                    <div className="flex-1 overflow-auto space-y-3 pr-2">
                        {records.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No records found.</p>
                        ) : (
                            records.map((r) => (
                                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-white/50 transition-colors">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${r.uploaded_by === 'doctor' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate">{r.test_name || r.record_type}</h4>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(r.date).toLocaleDateString()} • {r.uploaded_by === 'doctor' ? 'Uploaded by You' : 'Uploaded by Patient'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>
            </div>

            <UploadPatientRecordModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                patientId={patient.id}
            />
        </div>
    );
}
