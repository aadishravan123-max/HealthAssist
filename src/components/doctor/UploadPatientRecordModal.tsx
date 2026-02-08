'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';


interface UploadPatientRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string | null;
}

export function UploadPatientRecordModal({ isOpen, onClose, patientId }: UploadPatientRecordModalProps) {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !user || !patientId || !title) return;
        setLoading(true);

        try {
            // 1. Upload File to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${patientId}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('medical-records')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Create DB Record
            const { error: dbError } = await supabase
                .from('medical_records')
                .insert({
                    user_id: patientId, // The patient's ID
                    record_type: 'prescription', // Defaulting for simplicity, could be dropdown
                    file_path: fileName,
                    doctor_name: user.email, // Or fetch doctor profile name
                    uploaded_by: 'doctor',
                    doctor_id: user.id,
                    test_name: title,
                    date: new Date().toISOString(),
                    test_category: 'Doctor Upload',
                    status: 'completed'
                });

            if (dbError) throw dbError;

            alert('Record uploaded successfully for patient!');
            onClose();
            setFile(null);
            setTitle('');
        } catch (error) {
            console.error('Error uploading:', error);
            alert(`Upload failed: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!patientId) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle>Upload Record for Patient</DialogTitle>
                    <DialogDescription>
                        Upload a prescription or report for this patient.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Record Title</label>
                        <Input
                            placeholder="e.g. Prescription for Cough"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        {file ? (
                            <div className="flex items-center gap-2 text-medical-primary">
                                <FileText className="h-8 w-8" />
                                <span className="text-sm font-medium">{file.name}</span>
                                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500 font-medium">Click to upload file</p>
                                <p className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</p>
                            </>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={loading || !file || !title} className="bg-medical-primary text-white hover:bg-medical-primary/90">
                        {loading ? 'Uploading...' : 'Upload Record'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
