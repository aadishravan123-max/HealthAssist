'use client';

import React from 'react';
import { Doctor } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface DoctorCardProps {
    doctor: Doctor;
    onBook: (doctor: Doctor) => void;
}

export function DoctorCard({ doctor, onBook }: DoctorCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
        >
            <GlassCard className="h-full relative overflow-hidden group border-white/40 bg-white/60 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                {/* Gradient Background Highlight on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-teal-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-teal-500/5 transition-all duration-500" />

                <div className="p-6 flex flex-col h-full relative z-10">
                    {/* Header / Avatar */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                <AvatarImage src={`/placeholder-doctor.jpg`} alt={doctor.full_name} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-xl font-bold">
                                    {doctor.full_name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md">
                                <div className="bg-green-500 h-3 w-3 rounded-full border-2 border-white" />
                            </div>
                        </div>

                        <h3 className="font-bold text-xl text-foreground mb-1 group-hover:text-blue-700 transition-colors">
                            {doctor.full_name}
                        </h3>
                        <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2">
                            {doctor.specialization || 'General Specialist'}
                        </p>
                    </div>

                    {/* Stats / Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6 w-full">
                        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/40 border border-white/60">
                            <div className="flex items-center gap-1 text-amber-500 mb-1">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-bold text-slate-700">4.9</span>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Rating</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/40 border border-white/60">
                            <div className="font-bold text-slate-700 mb-1">
                                {doctor.experience_years || '5+'} <span className="text-xs font-normal text-muted-foreground">Yrs</span>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Experience</span>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-start gap-3 text-sm text-slate-600">
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{doctor.hospital_name || 'HealthAssist Medical Center, New York'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>Next Available: <span className="font-medium text-emerald-600">Today, 2:00 PM</span></span>
                        </div>
                    </div>

                    {/* Action */}
                    <Button
                        onClick={() => onBook(doctor)}
                        className="w-full bg-slate-900 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 rounded-xl h-11 group/btn relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Book Appointment <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                    </Button>
                </div>
            </GlassCard>
        </motion.div>
    );
}
