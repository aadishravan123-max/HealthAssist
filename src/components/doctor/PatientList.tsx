'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Patient } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

interface PatientListProps {
    onSelect: (patient: Patient) => void;
}

export function PatientList({ onSelect }: PatientListProps) {
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPatients = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Get patients who have appointments with this doctor
                const { data: appointmentData, error } = await supabase
                    .from('appointments')
                    .select('patient_id, profiles:patient_id(id, full_name, age, gender)')
                    .eq('doctor_id', user.id);

                if (error) throw error;

                // Deduplicate patients
                const uniquePatientsMap = new Map();
                appointmentData?.forEach((item: { profiles: any }) => {
                    const p = item.profiles;
                    if (p && !uniquePatientsMap.has(p.id)) {
                        uniquePatientsMap.set(p.id, {
                            id: p.id,
                            name: p.full_name || 'Unknown',
                            full_name: p.full_name,
                            age: p.age,
                            gender: p.gender,
                            status: 'active', // Derived status could be added later
                            lastVisit: new Date().toISOString().split('T')[0],
                            condition: 'General Checkup' // Placeholder
                        });
                    }
                });

                setPatients(Array.from(uniquePatientsMap.values()));
            } catch (err) {
                console.error('Error fetching patients:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, [user]);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <GlassCard className="h-full flex flex-col overflow-hidden bg-white/60">
            <div className="p-4 border-b border-border/10">
                <h2 className="font-semibold mb-4">My Patients</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients..."
                        className="pl-9 bg-white/50 border-0 focus-visible:ring-0 focus-visible:bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-2 space-y-1">
                {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading patients...</div>
                ) : filteredPatients.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">No patients found.</div>
                ) : (
                    filteredPatients.map((patient) => (
                        <div
                            key={patient.id}
                            onClick={() => {
                                setSelectedId(patient.id);
                                onSelect(patient);
                            }}
                            className={cn(
                                "p-3 rounded-lg cursor-pointer transition-all hover:bg-white/50 flex items-center gap-3",
                                selectedId === patient.id ? "bg-medical-primary/10 border-l-2 border-medical-primary" : "border-l-2 border-transparent"
                            )}
                        >
                            <Avatar className="h-10 w-10 border border-border/50">
                                <AvatarImage src={`/placeholder-user.jpg`} />
                                <AvatarFallback className="text-xs">{patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-sm truncate">{patient.name}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {patient.status} • {patient.condition}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </GlassCard>
    );
}
