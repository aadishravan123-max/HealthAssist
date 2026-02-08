'use client';

import React, { useState, useEffect } from 'react';
import { PatientList } from '@/components/doctor/PatientList';
import { PatientSummary } from '@/components/doctor/PatientSummary';
import { AINoteAssistant } from '@/components/doctor/AINoteAssistant';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, Calendar, Building2, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/supabaseClient';

import { Patient } from '@/lib/types';

export default function DoctorDashboard() {
    const { user, profile: doctorProfile } = useAuth();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    return (
        <div className="space-y-6 pb-20">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-4 flex items-center gap-4 bg-white/70">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Patients</p>
                        <h3 className="text-2xl font-bold text-foreground">12</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4 bg-white/70">
                    <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Appointments</p>
                        <h3 className="text-lg font-bold text-foreground">5 Today</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4 bg-white/70">
                    <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Hospital</p>
                        <h3 className="text-lg font-bold text-foreground truncate" title={doctorProfile?.hospital_name}>
                            {doctorProfile?.hospital_name || 'Not set'}
                        </h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4 bg-white/70">
                    <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Award className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Experience</p>
                        <h3 className="text-lg font-bold text-foreground">
                            {doctorProfile?.experience_years ? `${doctorProfile.experience_years} Years` : '-'}
                        </h3>
                    </div>
                </GlassCard>
            </div>

            <div className="h-[calc(100vh-theme(spacing.48))] grid grid-cols-12 gap-6">
                {/* Left: Patient List */}
                <div className="col-span-3 h-full">
                    <PatientList onSelect={(p) => setSelectedPatient(p)} />
                </div>

                {/* Center: Main Clinical View */}
                <div className="col-span-6 h-full">
                    <PatientSummary patient={selectedPatient} />
                </div>

                {/* Right: AI Assistant */}
                <div className="col-span-3 h-full">
                    <AINoteAssistant />
                </div>
            </div>
        </div>
    );
}
