'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from 'lucide-react';
import { MEDICAL_TESTS } from '@/lib/constants/medicalTests';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type TestParameter = {
    name: string;
    unit: string;
    range: string;
}

type TestDefinition = {
    name: string;
    parameters: TestParameter[];
}

type MedicalTestsType = {
    [key: string]: TestDefinition[];
}

const medicalTestsData = MEDICAL_TESTS as MedicalTestsType;

export function UploadRecordModal({ onRecordAdded, children }: { onRecordAdded?: () => void, children?: React.ReactNode }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('lab');

    // Lab Test State
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedTestIndex, setSelectedTestIndex] = useState<string>('');
    const [testDate, setTestDate] = useState<string>('');
    const [testValues, setTestValues] = useState<Record<string, string>>({});

    // Prescription State
    const [doctorName, setDoctorName] = useState('');
    const [prescriptionDate, setPrescriptionDate] = useState<string>('');
    const [prescriptionText, setPrescriptionText] = useState('');

    const handleLabSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedCategory || !selectedTestIndex) return;

        setIsLoading(true);
        try {
            const test = medicalTestsData[selectedCategory][parseInt(selectedTestIndex)];

            const { error } = await supabase.from('medical_records').insert({
                user_id: user.id,
                record_type: 'lab_test',
                date: testDate || new Date().toISOString().split('T')[0],
                test_category: selectedCategory,
                test_name: test.name,
                test_results: testValues // Storing as JSONB
            });

            if (error) throw error;

            setIsOpen(false);
            resetForm();
            if (onRecordAdded) onRecordAdded();
        } catch (error) {
            console.error("Error uploading lab test:", error);
            alert("Failed to upload record. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrescriptionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !doctorName || !prescriptionText) return;

        setIsLoading(true);
        try {
            const { error } = await supabase.from('medical_records').insert({
                user_id: user.id,
                record_type: 'prescription',
                date: prescriptionDate || new Date().toISOString().split('T')[0],
                doctor_name: doctorName,
                prescription_text: prescriptionText
            });

            if (error) throw error;

            setIsOpen(false);
            resetForm();
            if (onRecordAdded) onRecordAdded();
        } catch (error) {
            console.error("Error uploading prescription:", error);
            alert("Failed to upload prescription. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedCategory('');
        setSelectedTestIndex('');
        setTestValues({});
        setDoctorName('');
        setPrescriptionText('');
        setTestDate(new Date().toISOString().split('T')[0]);
        setPrescriptionDate(new Date().toISOString().split('T')[0]);
    };

    // Helper to get tests for selected category
    const availableTests = selectedCategory ? medicalTestsData[selectedCategory] : [];
    const selectedTest = (selectedCategory && selectedTestIndex !== '') ? availableTests[parseInt(selectedTestIndex)] : null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white gap-2">
                        <Plus className="h-4 w-4" />
                        Upload Record
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upload Medical Record</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="lab">Lab Test Report</TabsTrigger>
                        <TabsTrigger value="prescription">Prescription</TabsTrigger>
                    </TabsList>

                    <TabsContent value="lab">
                        <form onSubmit={handleLabSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setSelectedTestIndex(''); setTestValues({}); }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(MEDICAL_TESTS).map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Test Name</Label>
                                    <Select value={selectedTestIndex} onValueChange={setSelectedTestIndex} disabled={!selectedCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Test" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableTests.map((test, idx) => (
                                                <SelectItem key={idx} value={idx.toString()}>{test.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Date of Test</Label>
                                <Input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} required />
                            </div>

                            {selectedTest && (
                                <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
                                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Enter Results</h3>
                                    {selectedTest.parameters.map((param) => (
                                        <div key={param.name} className="gap-4 mb-3">
                                            <div className="flex justify-between mb-1">
                                                <Label className="text-sm font-medium">{param.name}</Label>
                                                <span className="text-xs text-muted-foreground">Normal: {param.range} {param.unit}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Value"
                                                    value={testValues[param.name] || ''}
                                                    onChange={(e) => setTestValues(prev => ({ ...prev, [param.name]: e.target.value }))}
                                                />
                                                <span className="text-sm text-muted-foreground w-12">{param.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading || !selectedTest}>
                                    {isLoading ? <LoadingSpinner size={16} className="mr-2 text-white" /> : null}
                                    Save Record
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="prescription">
                        <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Doctor&apos;s Name</Label>
                                    <Input
                                        placeholder="Dr. Smith"
                                        value={doctorName}
                                        onChange={(e) => setDoctorName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={prescriptionDate}
                                        onChange={(e) => setPrescriptionDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Prescription Details</Label>
                                <Textarea
                                    placeholder="Enter medications, dosage, and instructions..."
                                    className="min-h-[150px]"
                                    value={prescriptionText}
                                    onChange={(e) => setPrescriptionText(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Save Prescription
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
