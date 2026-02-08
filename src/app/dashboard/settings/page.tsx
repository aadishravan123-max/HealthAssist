'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/supabaseClient';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Save } from 'lucide-react';

export default function SettingsPage() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        age: '',
        gender: '',
        doctor_name: '',
        specialization: '',
        experience_years: '',
        hospital_name: ''
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                age: profile.age?.toString() || '',
                gender: profile.gender || '',
                doctor_name: profile.doctor_name || '',
                specialization: profile.specialization || '',
                experience_years: profile.experience_years?.toString() || '',
                hospital_name: profile.hospital_name || ''
            });
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const updates: any = {
                id: user.id,
                full_name: formData.full_name,
                updated_at: new Date().toISOString(),
            };

            if (profile?.role === 'doctor') {
                updates.specialization = formData.specialization;
                updates.experience_years = formData.experience_years ? parseInt(formData.experience_years) : null;
                updates.hospital_name = formData.hospital_name;
            } else {
                updates.age = formData.age ? parseInt(formData.age) : null;
                updates.gender = formData.gender;
                updates.doctor_name = formData.doctor_name;
            }

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;
            alert('Profile updated successfully!');
            // Ideally refresh auth context here, but a reload works for now or let context subscription handle it if set up
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and profile information.</p>
            </div>

            <GlassCard className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-medical-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-medical-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                        <p className="text-sm text-muted-foreground">Update your personal details.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            value={user?.email || ''}
                            disabled
                            className="bg-slate-100 text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                    </div>

                    {profile.role === 'patient' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Age</label>
                                    <Input
                                        name="age"
                                        type="number"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="30"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Primary Doctor Name</label>
                                <Input
                                    name="doctor_name"
                                    value={formData.doctor_name}
                                    onChange={handleChange}
                                    placeholder="Dr. Smith"
                                />
                            </div>
                        </>
                    )}

                    {profile.role === 'doctor' && (
                        <>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Specialization</label>
                                <Input
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    placeholder="General Practitioner"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Experience (Years)</label>
                                    <Input
                                        name="experience_years"
                                        type="number"
                                        value={formData.experience_years}
                                        onChange={handleChange}
                                        placeholder="10"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Hospital Name</label>
                                    <Input
                                        name="hospital_name"
                                        value={formData.hospital_name}
                                        onChange={handleChange}
                                        placeholder="City Hospital"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading} className="bg-medical-primary text-white hover:bg-medical-primary/90">
                            {loading ? (
                                <span className="flex items-center gap-2">Saving...</span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
}
