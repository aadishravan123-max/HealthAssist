'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Doctor } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

interface BookAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor | null;
}

export function BookAppointmentModal({ isOpen, onClose, doctor }: BookAppointmentModalProps) {
    const { user } = useAuth();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBook = async () => {
        if (!user || !doctor || !date || !time) return;
        setLoading(true);

        try {
            const appointmentDate = new Date(`${date}T${time}`);

            const { error } = await supabase
                .from('appointments')
                .insert({
                    patient_id: user.id,
                    doctor_id: doctor.id,
                    appointment_date: appointmentDate.toISOString(),
                    reason: reason,
                    status: 'pending'
                });

            if (error) throw error;

            alert('Appointment booked successfully!');
            onClose();
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment.');
        } finally {
            setLoading(false);
        }
    };

    if (!doctor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle>Book Appointment</DialogTitle>
                    <DialogDescription>
                        Schedule a visit with Dr. {doctor.full_name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Date</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                className="pl-9"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="time"
                                className="pl-9"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Reason for Visit</label>
                        <Textarea
                            placeholder="Briefly describe your symptoms or reason for visit..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleBook} disabled={loading} className="bg-medical-primary text-white hover:bg-medical-primary/90">
                        {loading ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
