'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabaseClient';

import { UserProfile } from '@/lib/types';

export type UserRole = 'patient' | 'doctor' | 'admin' | null;

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: UserRole;
    roles: UserRole[];
    profile: UserProfile | null; // Added profile
    loading: boolean;
    signOut: () => Promise<void>;
    switchRole: (role: UserRole) => void;
    isOnboarded: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    role: null,
    roles: [],
    profile: null,
    loading: true,
    signOut: async () => { },
    switchRole: () => { },
    isOnboarded: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (currentUser: User) => {
        try {
            console.log('Auth: Fetching profile for', currentUser.id);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (error || !data) {
                console.warn('Auth: Profile not found or error:', error?.message);

                // Self-healing: Create profile if missing
                console.log('Auth: Attempting to create missing profile...');

                // Attempt to insert
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .upsert([{
                        id: currentUser.id,
                        role: currentUser.user_metadata?.role || 'patient', // improved default from metadata
                        roles: [currentUser.user_metadata?.role || 'patient'],
                        full_name: currentUser.user_metadata?.full_name || 'New User',
                        email: currentUser.email,
                        is_onboarded: false
                    }])
                    .select()
                    .single();

                if (createError) {
                    console.error('Auth: Critical - Failed to create fallback profile:', createError);
                    // Even if creation fails, we must stop loading to let UI render (likely AuthGuard will redirect or show error)
                    setRoles(['patient']);
                    setRole('patient');
                    return;
                }

                console.log('Auth: Fallback profile created/loaded successfully.');
                setProfile(newProfile);
                setRoles(['patient']);
                setRole('patient');
                return;
            }

            setProfile(data);
            console.log('Auth: Profile loaded:', data.role);

            // Parse roles
            let userRoles: UserRole[] = [];
            if (data?.roles && Array.isArray(data.roles)) {
                userRoles = data.roles as UserRole[];
            } else if (data?.role) {
                userRoles = [data.role as UserRole];
            } else {
                userRoles = ['patient'];
            }

            // Auto-provision role if needed (Dev Helper)
            // If user logged in intending to be a specific role (from localStorage set by Login page),
            // but their profile doesn't have it, we add it.
            const intendedRole = localStorage.getItem('last_active_role') as UserRole;

            if (intendedRole && ['doctor', 'patient'].includes(intendedRole) && !userRoles.includes(intendedRole)) {
                console.log(`Auth: Auto-provisioning missing role: ${intendedRole}`);

                // User requested fix: ensure role is strictly the intended one (e.g. Doctor), not mixed.
                // If intended is doctor, we make them fully doctor.
                const newUserRoles = [intendedRole];

                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        roles: newUserRoles,
                        role: intendedRole // Sync legacy column
                    })
                    .eq('id', currentUser.id);

                if (!updateError) {
                    userRoles = newUserRoles;
                    // Force a profile refresh or just update local state
                    console.log('Auth: Role added successfully');
                } else {
                    console.error('Auth: Failed to auto-provision role:', updateError);
                }
            }

            setRoles(userRoles);

            // Determine active role
            // Now that we may have added it, this check should pass
            if (intendedRole && userRoles.includes(intendedRole)) {
                setRole(intendedRole);
            } else {
                setRole(userRoles[0]);
            }

        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            setRoles(['patient']);
            setRole('patient');
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            console.log('Auth: Initializing...');
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!mounted) return;

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    console.log('Auth: User found, fetching profile...');
                    await fetchUserProfile(session.user);
                } else {
                    console.log('Auth: No user session found.');
                }
            } catch (error) {
                console.error("Auth init error:", error);
            } finally {
                if (mounted) {
                    console.log('Auth: Initialization complete, setting loading=false');
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`Auth: Auth state change: ${event}`);
            if (!mounted) return;

            setSession(session);
            const newUser = session?.user ?? null;
            setUser(newUser);

            if (newUser) {
                await fetchUserProfile(newUser);
            } else {
                setRole(null);
                setRoles([]);
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setRole(null);
            setRoles([]);
            setProfile(null);
            setUser(null);
            setSession(null);
            localStorage.removeItem('last_active_role');
            // Force redirect to clear any state issues
            window.location.href = '/login';
        }
    };

    const switchRole = (newRole: UserRole) => {
        if (roles.includes(newRole)) {
            setRole(newRole);
            localStorage.setItem('last_active_role', newRole || '');
            window.location.href = newRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';
        }
    };

    const isOnboarded = profile?.is_onboarded || false;

    return (
        <AuthContext.Provider value={{ user, session, role, roles, profile, loading, signOut, switchRole, isOnboarded }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
