'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Activity, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';
import { motion } from 'framer-motion';

export function Header() {
    const { user, profile, signOut } = useAuth();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [status, setStatus] = useState<'online' | 'busy' | 'away'>('online');

    const getInitials = (name: string) => {
        return name
            ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
            : 'U';
    };

    const statusColors = {
        online: 'bg-emerald-500',
        busy: 'bg-red-500',
        away: 'bg-amber-500'
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-4 z-30 mx-6 mb-2 rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-lg px-6 h-16 flex items-center justify-between"
        >
            {/* Search Bar */}
            <div className="flex-1 max-w-md hidden md:flex items-center gap-2 relative">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search patients, records, or symptoms..."
                    className="pl-9 bg-white/50 border-white/30 focus:bg-white transition-all rounded-xl h-10 w-full"
                />
            </div>

            <div className="md:hidden font-semibold text-lg text-foreground">HealthAssist</div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">

                {/* Status Toggle */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-white/30">
                    <span className={cn("h-2.5 w-2.5 rounded-full animate-pulse", statusColors[status])} />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
                    >
                        <option value="online">Online</option>
                        <option value="busy">Do Not Disturb</option>
                        <option value="away">On Break</option>
                    </select>
                </div>

                <div className="h-8 w-px bg-border/20 hidden sm:block" />

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "relative rounded-full hover:bg-white/50 transition-colors h-10 w-10",
                            isNotificationOpen && "bg-white/50"
                        )}
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    >
                        <Bell className="h-5 w-5 text-slate-600" />
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                    </Button>
                    <NotificationDropdown
                        isOpen={isNotificationOpen}
                        onClose={() => setIsNotificationOpen(false)}
                    />
                </div>

                <div className="relative">
                    <div
                        className="flex items-center gap-3 pl-2 cursor-pointer"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold leading-none text-foreground">
                                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                                {profile?.role || 'Guest'}
                            </p>
                        </div>
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm hover:scale-105 transition-transform">
                            <AvatarImage src="/placeholder-user.jpg" alt="User" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                                {getInitials(profile?.full_name || '')}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-14 w-56 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl p-2 z-50"
                            >
                                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                                    <p className="font-semibold text-sm text-slate-800">{profile?.full_name || 'User'}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <Button
                                        variant="ghost"
                                        className="w-fulljustify-start h-9 text-xs font-medium text-slate-600 hover:text-slate-900"
                                        onClick={() => {
                                            // Ensure this redirects correctly; implement navigation later if needed
                                            window.location.href = '/dashboard/settings';
                                        }}
                                    >
                                        My Profile
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-9 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={async () => {
                                            await signOut();
                                            setIsProfileOpen(false);
                                        }}
                                    >
                                        Sign Out
                                    </Button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>
        </motion.header>
    );
}
