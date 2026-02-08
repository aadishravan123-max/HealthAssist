'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';

export default function OnboardingPage() {
    const { user, role, roles, switchRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const [onboardingMode, setOnboardingMode] = useState<'patient' | 'doctor'>(role === 'doctor' ? 'doctor' : 'patient');

    // State for all possible form fields
    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        gender: '',
        doctor_name: '',
        specialization: '',
        experience: '',
        hospital: ''
    });

    // Check if user already has the role they are trying to onboard for
    const hasRole = (r: string) => roles?.includes(r as any);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) {
                alert('Session lost. Please log in again.');
                return;
            }

            // 1. Prepare profile updates
            const updates: any = {
                id: user.id,
                full_name: formData.full_name,
                updated_at: new Date().toISOString(),
                is_onboarded: true // Mark as onboarded
            };

            if (onboardingMode === 'doctor') {
                updates.specialization = formData.specialization;
                updates.experience_years = formData.experience ? parseInt(formData.experience) : null;
                updates.hospital_name = formData.hospital;
            } else {
                updates.age = formData.age ? parseInt(formData.age) : null;
                updates.gender = formData.gender;
                updates.doctor_name = formData.doctor_name;
            }

            // 2. Add role if missing
            let newRoles = [...(roles || [])];
            if (!newRoles.includes(onboardingMode)) {
                newRoles.push(onboardingMode);
                updates.roles = newRoles;
            }

            // 3. Update DB
            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            console.log('Profile updated successfully');

            // 4. Force hard redirect to ensure AuthContext refreshes with new data
            window.location.href = onboardingMode === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';

        } catch (error) {
            console.error('Error updating profile:', error);
            alert(`Failed to save profile: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-medical-bg p-4">
            <GlassCard className="max-w-md w-full p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto h-12 w-12 bg-medical-primary/10 rounded-full flex items-center justify-center mb-4">
                        <User className="h-6 w-6 text-medical-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">HealthAssist Profile</h1>
                    <p className="text-muted-foreground mt-2">
                        Setting up as a <span className="font-semibold text-medical-primary capitalize">{onboardingMode}</span>
                    </p>
                </div>

                {/* Role Switcher tabs (if not stuck in one flow) */}
                <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                    <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${onboardingMode === 'patient' ? 'bg-white shadow-sm text-medical-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setOnboardingMode('patient')}
                    >
                        Patient
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${onboardingMode === 'doctor' ? 'bg-white shadow-sm text-medical-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setOnboardingMode('doctor')}
                    >
                        Doctor
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                            required
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                    </div>

                    {onboardingMode === 'doctor' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Specialization</label>
                                <Input
                                    required
                                    placeholder="e.g. Cardiologist"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Experience (Years)</label>
                                    <Input
                                        required
                                        type="number"
                                        placeholder="10"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Hospital Name</label>
                                    <Input
                                        required
                                        placeholder="City General"
                                        value={formData.hospital}
                                        onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Age</label>
                                    <Input
                                        required
                                        type="number"
                                        placeholder="30"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Gender</label>
                                    <select
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Primary Doctor's Name</label>
                                <Input
                                    placeholder="Dr. Smith (Optional)"
                                    value={formData.doctor_name}
                                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white"
                        disabled={loading}
                    >
                        {loading ? 'Save Profile' : (hasRole(onboardingMode) ? 'Update Profile' : `Join as ${onboardingMode === 'doctor' ? 'Doctor' : 'Patient'}`)}
                    </Button>
                </form>
            </GlassCard>
        </div>
    );
}
