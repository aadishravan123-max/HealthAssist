'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const { user, role, profile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not authenticated, redirect to login
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                return;
            }

            // Check if profile is complete
            if (!profile) {
                console.log('AuthGuard: No profile found. Path:', pathname);
                // No profile found - critical state for a logged-in user
                // Redirect to onboarding to create one
                if (!pathname.includes('/onboarding')) {
                    console.log('AuthGuard: Redirecting to /onboarding due to missing profile');
                    window.location.href = '/onboarding';
                }
                // Don't render dashboard while redirecting or if on onboarding (to avoid double render issues)
                return;
            } else {
                // Check if profile is marked as onboarded
                if (!profile.is_onboarded && !pathname.includes('/onboarding')) {
                    console.log('AuthGuard: User not onboarded, redirecting to /onboarding');
                    window.location.href = '/onboarding';
                    return;
                }
            }

            let effectiveAllowedRoles = allowedRoles;
            if (!effectiveAllowedRoles) {
                if (pathname.startsWith('/dashboard/doctor')) {
                    effectiveAllowedRoles = ['doctor'];
                } else if (pathname.startsWith('/dashboard/patient')) {
                    effectiveAllowedRoles = ['patient'];
                }
            }

            if (effectiveAllowedRoles && role && !effectiveAllowedRoles.includes(role)) {
                // Authenticated but wrong role
                // Redirect to appropriate dashboard based on actual role
                const target = role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';
                if (pathname !== target && !pathname.startsWith(target)) { // Allow sub-routes
                    router.push(target);
                }
            }
        }
    }, [user, role, profile, loading, router, pathname, allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner size={48} className="text-blue-600" />
                    <p className="text-slate-500 font-medium">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!user) return null; // Will redirect

    // Critical: If we are not on onboarding, but profile is missing or incomplete, 
    // we must NOT render the dashboard children.
    if (!pathname.includes('/onboarding')) {
        if (!profile) {
            return (
                <div className="flex h-screen w-full items-center justify-center bg-medical-bg">
                    <div className="flex flex-col items-center gap-4">
                        <LoadingSpinner size={32} className="text-blue-600" />
                        <p className="text-sm text-muted-foreground">Setting up your profile...</p>
                    </div>
                </div>
            );
        }

        if (!profile.is_onboarded) {
            return (
                <div className="flex h-screen w-full items-center justify-center bg-medical-bg">
                    <div className="flex flex-col items-center gap-3">
                        <LoadingSpinner size={32} className="text-blue-600" />
                        <p className="text-slate-500 text-sm">Redirecting to login...</p>
                    </div>
                </div>
            );
        }
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) return null; // Will redirect

    return <>{children}</>;
}
