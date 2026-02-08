'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Award, Stethoscope, Filter, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BookAppointmentModal } from '@/components/patient/BookAppointmentModal';
import { Doctor } from '@/lib/types';
import { DoctorCard } from '@/components/patient/DoctorCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function FindDoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All Specialists');

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                // Fetch profiles where roles (jsonb array) contains 'doctor'
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'doctor');

                if (error) throw error;
                setDoctors(data as Doctor[]);
            } catch (error: any) {
                console.error('Error fetching doctors full:', JSON.stringify(error, null, 2));
                console.error('Error message:', error.message);
                console.error('Error details:', error.details);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc =>
        (activeCategory === 'All Specialists' || doc.specialization === activeCategory) &&
        (doc.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleBookClick = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const categories = ['All Specialists', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician'];

    return (
        <div className="space-y-10 pb-20 relative">
            {/* 1. Hero Section */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-sky-800 text-white shadow-2xl p-8 md:p-12 mb-8">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-blue-900/80 to-transparent" />

                <div className="relative z-10 max-w-2xl space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                            Meet the people <br />
                            <span className="text-sky-300">who care.</span>
                        </h1>
                        <p className="text-lg text-blue-100 max-w-lg leading-relaxed opacity-90">
                            Connect with trusted medical professionals who prioritize your well-being. Expert care, just an appointment away.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-wrap gap-3 pt-2"
                    >
                        <Button className="bg-white text-blue-900 hover:bg-blue-50 rounded-full h-12 px-8 font-semibold text-base shadow-lg hover:shadow-xl transition-all">
                            Find a Specialist
                        </Button>
                        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full h-12 px-6 backdrop-blur-md">
                            Emergency Care <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* 2. Floating Search & Filter Bar */}
            <div className="sticky top-24 z-20 -mt-20 px-4 md:px-0">
                <GlassCard className="p-2 md:p-3 flex flex-col md:flex-row gap-4 items-center bg-white/80 backdrop-blur-xl border-white/50 shadow-xl rounded-2xl">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search doctors, specialties, or clinics..."
                            className="pl-12 bg-white/50 border-transparent hover:border-blue-200 focus:border-blue-400 focus:bg-white h-14 rounded-xl transition-all text-base shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide px-1">
                        <Button variant="outline" className="h-14 px-6 rounded-xl border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 bg-white/50 shadow-sm transition-all whitespace-nowrap">
                            <MapPin className="h-4 w-4 mr-2" />
                            Location
                        </Button>
                        <Button variant="outline" className="h-14 px-6 rounded-xl border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 bg-white/50 shadow-sm transition-all whitespace-nowrap">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </GlassCard>
            </div>

            {/* 3. Category Pills using Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
                {categories.map((cat, i) => (
                    <motion.button
                        key={cat}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.3 }}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${activeCategory === cat
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                    >
                        {cat}
                    </motion.button>
                ))}
            </div>

            {/* 4. Doctors Grid */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[420px] rounded-3xl bg-white/40 animate-pulse border border-white/40" />
                        ))}
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="mx-auto h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                            <Stethoscope className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No pros found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            We couldn&apos;t find any doctors matching &quot;{searchTerm}&quot;. Try adjusting your search or filters.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDoctors.map((doc, index) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <DoctorCard doctor={doc} onBook={handleBookClick} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <BookAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                doctor={selectedDoctor}
            />
        </div>
    );
}
