'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Calendar, Clock, User, Video, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DoctorConsultationsPage() {
    const [selectedAppointment, setSelectedAppointment] = React.useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

    const appointments = [
        { id: 1, patient: "Alice Smith", time: "09:00 AM", type: "General Checkup", mode: "In-Person", reason: "Annual physical examination", age: 34, history: "None" },
        { id: 2, patient: "Bob Jones", time: "10:30 AM", type: "Follow-up", mode: "Video Call", reason: "Post-surgery review", age: 45, history: "Knee surgery (2 weeks ago)" },
        { id: 3, patient: "Charlie Brown", time: "02:00 PM", type: "Consultation", mode: "In-Person", reason: "Persistent headache", age: 28, history: "Migraines" },
    ];

    const handleStart = (apt: any) => {
        if (apt.mode === 'Video Call') {
            const width = 800;
            const height = 600;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            // Open a mock video call window or navigate to a call page
            // For now, let's just alert
            alert(`Starting secure video call with ${apt.patient}...`);
        } else {
            alert(`Marking ${apt.patient} as checked-in for in-person visit.`);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-4">Consultations</h1>
            <div className="grid gap-4">
                {appointments.map((apt) => (
                    <GlassCard key={apt.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {apt.patient.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{apt.patient}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {apt.time}</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {apt.type}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${apt.mode === 'Video Call' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                {apt.mode === 'Video Call' ? <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Video</span> : <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Clinic</span>}
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setSelectedAppointment(apt);
                                    setIsDetailsOpen(true);
                                }}
                            >
                                View Details
                            </Button>
                            <Button size="sm" onClick={() => handleStart(apt)}>Start</Button>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Details Modal */}
            {isDetailsOpen && selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <GlassCard className="w-full max-w-md bg-white p-6 relative">
                        <button
                            onClick={() => setIsDetailsOpen(false)}
                            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl text-blue-600 font-bold">
                                {selectedAppointment.patient.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{selectedAppointment.patient}</h2>
                                <p className="text-muted-foreground">ID: #PT-{1000 + selectedAppointment.id}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Age</p>
                                    <p className="font-medium">{selectedAppointment.age}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Mode</p>
                                    <p className="font-medium">{selectedAppointment.mode}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Reason for Visit</p>
                                <p className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    {selectedAppointment.reason}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Medical History</p>
                                <p className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    {selectedAppointment.history}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <Button className="flex-1" variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                            <Button className="flex-1" onClick={() => {
                                setIsDetailsOpen(false);
                                handleStart(selectedAppointment);
                            }}>
                                Start Consultation
                            </Button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
