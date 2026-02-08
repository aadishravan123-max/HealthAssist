'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
    const { role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('Dashboard Redirect Check:', { loading, role });

        if (!loading) {
            if (!role) {
                console.log('No role found, redirecting to login');
                router.replace('/login');
                return;
            }

            if (role === 'doctor') {
                console.log('Redirecting to doctor dashboard');
                router.replace('/dashboard/doctor');
            } else {
                console.log('Redirecting to patient dashboard');
                router.replace('/dashboard/patient');
            }
        }
    }, [role, loading, router]);

    return (
        <div className="flex h-full items-center justify-center">
            <LoadingSpinner size={32} />
        </div>
    );
}
