'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Activity, MessageSquare, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
    id: string;
    title: string;
    description: string;
    type: 'appointment' | 'vital' | 'system' | 'message' | 'reminder';
    timestamp: Date;
    isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Upcoming Appointment',
        description: 'Your consultation with Dr. Sarah Wilson is scheduled for tomorrow at 10:00 AM.',
        type: 'appointment',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        isRead: false,
    },
    {
        id: '2',
        title: 'New Health Insight',
        description: 'Based on your recent vitals, we have generated a new health report for you.',
        type: 'vital',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: false,
    },
    {
        id: '3',
        title: 'Prescription Ready',
        description: 'Your prescription for Amoxicillin is now ready for pickup at City Pharmacy.',
        type: 'system',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        isRead: true,
    },
    {
        id: '4',
        title: 'New Message',
        description: 'Dr. Smith sent you a message regarding your latest test results.',
        type: 'message',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: true,
    }
];

const iconMap = {
    appointment: Calendar,
    vital: Activity,
    system: CheckCircle2,
    message: MessageSquare,
    reminder: Bell,
};

const colorMap = {
    appointment: 'bg-blue-100 text-blue-600',
    vital: 'bg-red-100 text-red-600',
    system: 'bg-green-100 text-green-600',
    message: 'bg-purple-100 text-purple-600',
    reminder: 'bg-orange-100 text-orange-600',
};

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-14 z-50 w-80 sm:w-96 overflow-hidden rounded-xl border border-border/40 bg-white/90 shadow-xl backdrop-blur-lg"
                    >
                        <div className="flex items-center justify-between border-b p-4">
                            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
                            <button className="text-xs text-medical-primary hover:underline">Mark all as read</button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {MOCK_NOTIFICATIONS.length > 0 ? (
                                <div className="divide-y divide-border/10">
                                    {MOCK_NOTIFICATIONS.map((notification) => {
                                        const Icon = iconMap[notification.type];
                                        return (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    "flex gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer",
                                                    !notification.isRead && "bg-medical-primary/5"
                                                )}
                                                onClick={() => {
                                                    onClose();
                                                    // "Common sense" navigation
                                                    switch (notification.type) {
                                                        case 'appointment':
                                                            // Determine path based on typical role URL structure, or generic
                                                            // For now assuming we are in a context where we can navigate
                                                            // But we need to know if we are patient or doctor?
                                                            // Let's use window.location or assume patient/doctor based on context if possible,
                                                            // or simpler: just go to the likely path.
                                                            // Better: Use the current path to guess role 'dashboard/patient' vs 'dashboard/doctor'
                                                            const isDoctor = window.location.pathname.includes('/doctor');
                                                            window.location.href = isDoctor ? '/dashboard/doctor/consultations' : '/dashboard/patient/appointments';
                                                            break;
                                                        case 'vital':
                                                            window.location.href = '/dashboard/patient'; // Vitals are on dashboard
                                                            break;
                                                        case 'system':
                                                            window.location.href = '/dashboard/patient/records';
                                                            break;
                                                        case 'message':
                                                            const isDoc = window.location.pathname.includes('/doctor');
                                                            window.location.href = isDoc ? '/dashboard/doctor/messages' : '/dashboard/patient/ai-chat'; // Or messages if patient has it
                                                            break;
                                                        case 'reminder':
                                                            window.location.href = '/dashboard/patient/timeline';
                                                            break;
                                                    }
                                                }}
                                            >
                                                <div className={cn("h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center", colorMap[notification.type])}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className={cn("text-sm font-medium", !notification.isRead ? "text-foreground" : "text-muted-foreground")}>
                                                            {notification.title}
                                                        </p>
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {notification.description}
                                                    </p>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="h-2 w-2 mt-1.5 rounded-full bg-medical-primary flex-shrink-0" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <Bell className="mx-auto h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                                    <p className="text-sm text-muted-foreground">No new notifications</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t p-3 text-center">
                            <button className="text-xs font-medium text-muted-foreground hover:text-foreground">
                                View all notifications
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
