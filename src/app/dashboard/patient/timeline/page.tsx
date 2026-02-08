'use client';

import React from 'react';
import { Timeline } from '@/components/patient/Timeline';
import { motion } from 'framer-motion';

export default function TimelinePage() {
    return (
        <div className="space-y-8 pb-20">
            <div className="relative z-10 text-center space-y-2 mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600"
                >
                    Health Journey
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-500 max-w-lg mx-auto"
                >
                    A chronological history of your trusted medical records and events.
                </motion.p>
            </div>

            <div className="relative">
                {/* Background Mesh Gradient for Depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-purple-50/30 to-transparent blur-3xl -z-10" />

                <Timeline />
            </div>
        </div>
    );
}
