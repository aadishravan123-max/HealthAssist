'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, User, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface RecordDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    record: any;
}

export function RecordDetailsDialog({ isOpen, onClose, record }: RecordDetailsDialogProps) {
    if (!record) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden bg-white/95 backdrop-blur-xl">
                <DialogHeader className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900">{record.title}</DialogTitle>
                            <DialogDescription className="text-slate-500">{record.type} • {record.category}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                                <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</p>
                                    <p className="text-sm font-medium text-slate-700">{format(new Date(record.date || new Date()), 'MMMM d, yyyy')}</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                                <User className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Provider</p>
                                    <p className="text-sm font-medium text-slate-700">{record.doctor_name || 'Self Upload'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-indigo-500" />
                                Clinical Details
                            </h4>

                            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {
                                    // Lab Results Renderer
                                    record.test_results && typeof record.test_results === 'object' ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {Object.entries(record.test_results).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
                                                    <span className="text-sm font-medium text-slate-700 capitalize">{key.replace(/_/g, ' ')}</span>
                                                    <span className="text-sm font-bold text-indigo-600 font-mono">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // Standard Text Renderer
                                        <div className="whitespace-pre-wrap font-sans text-slate-600">
                                            {record.description || record.prescription_text || "No detailed content available."}
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
