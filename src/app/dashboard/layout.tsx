'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="flex h-screen w-full bg-medical-bg overflow-hidden relative">
                <Sidebar />
                <div className="flex-1 flex flex-col h-full transition-all duration-300 ease-in-out relative z-0">
                    <main className="flex-1 pb-6 overflow-y-auto h-full relative scroll-smooth">
                        <Header />
                        <div className="px-4 md:px-6 mx-auto max-w-7xl animate-fade-in pt-4">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <Toaster position="top-right" />
        </AuthGuard >
    );
}
