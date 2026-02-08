'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, Copy, FileText } from 'lucide-react';
import { analyzeMedicalTextAction } from '@/app/actions';

export function AINoteAssistant() {
    const [notes, setNotes] = useState('');
    const [structuredOutput, setStructuredOutput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStructureNotes = async () => {
        if (!notes.trim()) return;
        setLoading(true);

        const prompt = `Structure the following doctor's rough notes into a formal SOAP format (Subjective, Objective, Assessment, Plan). Keep it professional and concise.\n\nNotes: ${notes}`;

        const result = await analyzeMedicalTextAction(prompt);
        setStructuredOutput(result);
        setLoading(false);
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <GlassCard className="flex-1 flex flex-col p-4 bg-white/70">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Quick Notes
                    </h3>
                    <Button
                        size="sm"
                        className="bg-medical-primary/10 text-medical-primary hover:bg-medical-primary/20"
                        onClick={handleStructureNotes}
                        disabled={loading || !notes}
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI Structure
                            </>
                        )}
                    </Button>
                </div>
                <textarea
                    className="flex-1 w-full bg-white/50 border border-gray-200 rounded-lg p-3 resize-none focus:ring-2 focus:ring-medical-primary/20 focus:outline-none transition-all text-sm"
                    placeholder="Type rough patient notes here... e.g. 'Patient complains of headache since 2 days, BP 140/90, prescribed Aspirin'"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </GlassCard>

            {structuredOutput && (
                <GlassCard className="flex-1 flex flex-col p-4 bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-medical-primary flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            AI Suggestion
                        </h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-auto text-sm text-slate-600 font-mono bg-white/50 p-3 rounded border border-blue-50">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ ...props }) => <h1 className="text-base font-bold mb-2 text-medical-primary" {...props} />,
                                h2: ({ ...props }) => <h2 className="text-sm font-bold mb-1.5 mt-3 text-slate-800 border-b border-slate-200 pb-1" {...props} />,
                                h3: ({ ...props }) => <h3 className="text-sm font-semibold mb-1 mt-2 text-slate-700" {...props} />,
                                p: ({ ...props }) => <p className="mb-2 last:mb-0 text-slate-600" {...props} />,
                                strong: ({ ...props }) => <strong className="font-bold text-slate-800" {...props} />,
                                ul: ({ ...props }) => <ul className="list-disc pl-4 my-1 space-y-0.5" {...props} />,
                                ol: ({ ...props }) => <ol className="list-decimal pl-4 my-1 space-y-0.5" {...props} />,
                                li: ({ ...props }) => <li className="text-slate-600" {...props} />,
                            }}
                        >
                            {structuredOutput}
                        </ReactMarkdown>
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
