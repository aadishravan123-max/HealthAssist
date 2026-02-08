'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Shield, Mail, Lock, AlertTriangle, Stethoscope, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<'patient' | 'doctor'>('patient');
    const [isSignUp, setIsSignUp] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'doctor') setRole('doctor');

        const modeParam = searchParams.get('mode');
        if (modeParam === 'signup') setIsSignUp(true);
    }, [searchParams]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: role,
                        },
                    },
                });
                if (authError) throw authError;

                // Remember role for when they verify and login
                localStorage.setItem('last_active_role', role);

                alert('Signup successful! Please check your email for confirmation link.');
            } else {
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (authError) throw authError;

                // User wants to login as specific role
                localStorage.setItem('last_active_role', role);

                // Force redirect to specific dashboard
                router.push(role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
    };

    return (
        <GlassCard className="w-full max-w-md p-8 z-10 transition-all duration-500">
            <div className="flex flex-col items-center mb-6">
                <Link href="/" className="mb-4">
                    <div className="h-12 w-12 rounded-xl bg-medical-primary flex items-center justify-center shadow-lg shadow-medical-primary/20 hover:scale-105 transition-transform">
                        {role === 'doctor' ? <Stethoscope className="h-6 w-6 text-white" /> : <Shield className="h-6 w-6 text-white" />}
                    </div>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-muted-foreground mt-2 text-center text-sm">
                    {role === 'doctor' ? 'Access your medical practice portal' : 'Secure access to your health dashboard'}
                </p>
            </div>

            {/* Role Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-6 relative">
                <div
                    className={cn("absolute top-1 bottom-1 w-1/2 bg-white rounded-md shadow-sm transition-all duration-300",
                        role === 'patient' ? 'left-1' : 'left-[calc(50%-4px)] translate-x-1')}
                />
                <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={cn("flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 relative z-10 transition-colors", role === 'patient' ? 'text-medical-primary' : 'text-slate-500')}
                >
                    <User className="h-4 w-4" /> Patient
                </button>
                <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={cn("flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 relative z-10 transition-colors", role === 'doctor' ? 'text-medical-primary' : 'text-slate-500')}
                >
                    <Stethoscope className="h-4 w-4" /> Doctor
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="email"
                            placeholder={role === 'doctor' ? "dr.smith@hospital.com" : "name@example.com"}
                            className="pl-10 bg-white/50 border-gray-200 focus:bg-white transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 bg-white/50 border-gray-200 focus:bg-white transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white shadow-lg shadow-medical-primary/25 transition-all duration-300 transform hover:-translate-y-0.5"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <Button
                variant="outline"
                className="w-full bg-white/50 border-gray-200 hover:bg-gray-50 transition-all font-medium"
                onClick={handleGoogleLogin}
            >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Google
            </Button>

            <p className="mt-6 text-center text-sm text-gray-500">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="font-semibold text-medical-primary hover:underline underline-offset-4"
                >
                    {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
            </p>
        </GlassCard>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-medical-bg p-4 relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-medical-primary/10 blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-medical-accent/10 blur-[100px]" />

            <Suspense fallback={<div className="text-center">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
