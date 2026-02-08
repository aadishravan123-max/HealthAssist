'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function DoctorPatientsPage() {
    const { user } = useAuth();
    const router = useRouter(); // Use navigation
    const [patients, setPatients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
    const [newPatientEmail, setNewPatientEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            if (!user) return;
            // Mocking patient fetch - typically would fetch from a 'doctor_patients' join table
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'patient')
                .limit(20); // Fetched a bit more

            setPatients(data || []);
        };
        fetchPatients();
    }, [user]);

    // 1. Search Functionality
    const filteredPatients = patients.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddPatient = async () => {
        if (!newPatientEmail) return;
        setLoading(true);
        // Simulate invitation
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`Invitation sent to ${newPatientEmail}!`);
        setIsAddPatientOpen(false);
        setNewPatientEmail('');
        setLoading(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Patients</h1>
                <Button onClick={() => setIsAddPatientOpen(true)}>Add New Patient</Button>
            </div>

            <GlassCard className="p-4">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients by name or email..."
                        className="pl-9 max-w-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-4 font-medium text-muted-foreground">Patient</th>
                                <th className="p-4 font-medium text-muted-foreground">Age/Gender</th>
                                <th className="p-4 font-medium text-muted-foreground">Contact</th>
                                <th className="p-4 font-medium text-muted-foreground">Last Visit</th>
                                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{patient.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <span className="font-medium block">{patient.full_name}</span>
                                                    <span className="text-xs text-muted-foreground">ID: #{patient.id.substring(0, 4)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {patient.age || '-'} / {patient.gender || '-'}
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {patient.email}
                                        </td>
                                        <td className="p-4 text-muted-foreground">
                                            {new Date().toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        // Just a mock action or basic alert for 'View' if no page exists
                                                        // Or redirect to main dashboard to show summary?
                                                        // Let's redirect to messages for now as a 'Contact' action
                                                        alert(`Viewing details for ${patient.full_name}\n\nAge: ${patient.age}\nGender: ${patient.gender}\nEmail: ${patient.email}`);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={async () => {
                                                        if (!user) return;

                                                        // Check if conversation exists
                                                        const { data: existingConvs } = await supabase
                                                            .from('conversations')
                                                            .select('id')
                                                            .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${patient.id}),and(participant1_id.eq.${patient.id},participant2_id.eq.${user.id})`)
                                                            .single();

                                                        if (existingConvs) {
                                                            router.push(`/dashboard/doctor/messages?conversationId=${existingConvs.id}`);
                                                        } else {
                                                            // Create new conversation
                                                            const { data: newConv, error } = await supabase
                                                                .from('conversations')
                                                                .insert({
                                                                    participant1_id: user.id,
                                                                    participant2_id: patient.id,
                                                                    last_message: 'Started a new conversation',
                                                                    last_message_at: new Date().toISOString()
                                                                })
                                                                .select()
                                                                .single();

                                                            if (error) {
                                                                console.error('Error creating conversation:', error);
                                                                alert('Failed to start conversation');
                                                            } else if (newConv) {
                                                                router.push(`/dashboard/doctor/messages?conversationId=${newConv.id}`);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    Message
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        {searchTerm ? 'No patients found matching your search.' : 'No patients found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Add Patient Modal */}
            <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Patient</DialogTitle>
                        <DialogDescription>
                            Send an invitation to a patient to join your practice.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">Patient Email</label>
                        <Input
                            placeholder="patient@example.com"
                            value={newPatientEmail}
                            onChange={(e) => setNewPatientEmail(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddPatientOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddPatient} disabled={loading || !newPatientEmail}>
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
