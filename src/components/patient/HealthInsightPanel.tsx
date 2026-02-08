import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sparkles, ChevronDown, ChevronUp, Bot, ArrowRight, Activity, TrendingUp, Loader2, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyzeMedicalTextAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

export function HealthInsightPanel() {
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        recordCount: 0,
        appointmentCount: 0,
        hasVitals: false,
        lastVitalDate: null as string | null
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;

            const { count: recordCount } = await supabase
                .from('medical_records')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            const { count: aptCount } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('patient_id', user.id)
                .in('status', ['completed', 'confirmed']);

            // Generate a simple "Profile Completeness" or Activity score
            setStats({
                recordCount: recordCount || 0,
                appointmentCount: aptCount || 0,
                hasVitals: (recordCount || 0) > 0,
                lastVitalDate: null // We could fetch this if needed
            });
        };

        fetchStats();
    }, [user]);

    const generateInsight = async () => {
        setLoading(true);
        try {
            // Prompt to analyze the context provided by the Server Action
            const prompt = "Analyze my medical records briefly. Provide: 1) Key health observations (2-3 points), 2) Any concerning values, 3) 2-3 actionable lifestyle tips. Keep it concise and easy to read.";
            const result = await analyzeMedicalTextAction(prompt, undefined, user?.id);

            if (!result) throw new Error("No insight generated");

            setInsight(result);
            setIsExpanded(true);
            toast.success("Health analysis generated successfully");
        } catch (error) {
            console.error("Insight generation error:", error);
            toast.error("Failed to generate health insights. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="relative overflow-hidden border-indigo-200/50 bg-gradient-to-br from-white/90 to-indigo-50/50 shadow-xl group">
            {/* AI Glow Effect */}
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-colors duration-500" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg leading-none">Health AI</h3>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Insights & Trends</span>
                        </div>
                    </div>

                    {/* Activity Pill */}
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-indigo-100 rounded-full pl-1 pr-3 py-1">
                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                            <FileCheck2 className="h-3 w-3" />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{stats.recordCount} Records</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {!insight ? (
                        <div className="bg-white/50 rounded-xl p-4 border border-indigo-50 text-center">
                            <Activity className="h-8 w-8 text-indigo-300 mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-slate-600 font-medium">Ready to analyze your records</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {stats.recordCount > 0
                                    ? `AI will analyze your ${stats.recordCount} medical records.`
                                    : "Upload records to get personalized insights."}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-start gap-4 p-2 bg-indigo-50/50 rounded-lg">
                            <Sparkles className="h-5 w-5 text-indigo-500 mt-1 shrink-0 animate-pulse" />
                            <p className="text-sm font-medium text-slate-700">Analysis ready. Review your personalized health summary below.</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {isExpanded && insight && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-5 rounded-xl bg-white/60 border border-indigo-100 text-sm text-slate-700 leading-relaxed shadow-inner markdown-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            ul: ({ ...props }) => <ul className="list-disc pl-4 my-2 space-y-1 marker:text-indigo-500" {...props} />,
                                            ol: ({ ...props }) => <ol className="list-decimal pl-4 my-2 space-y-1 marker:text-indigo-500" {...props} />,
                                            li: ({ ...props }) => <li className="pl-1" {...props} />,
                                            p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                            strong: ({ ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                                            h1: ({ ...props }) => <h1 className="text-base font-bold mb-2 mt-3 text-slate-900" {...props} />,
                                            h2: ({ ...props }) => <h2 className="text-sm font-bold mb-1.5 mt-2 text-slate-800" {...props} />,
                                            h3: ({ ...props }) => <h3 className="text-sm font-semibold mb-1 mt-2 text-slate-700" {...props} />,
                                        }}
                                    >
                                        {insight}
                                    </ReactMarkdown>
                                    <div className="mt-4 pt-4 border-t border-indigo-100 flex items-center gap-2 text-xs text-slate-400">
                                        <Bot className="h-3 w-3" />
                                        <span>AI-generated analysis based on your records. Consult a doctor for diagnosis.</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button
                        onClick={insight ? () => setIsExpanded(!isExpanded) : generateInsight}
                        className="w-full justify-between bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 hover:border-indigo-300 shadow-sm h-12 rounded-xl group transition-all"
                        disabled={loading || stats.recordCount === 0}
                    >
                        <span className="font-semibold">
                            {loading ? 'Analyzing Health Data...' : (insight ? (isExpanded ? 'Hide Analysis' : 'Read Full Analysis') : 'Generate Health Report')}
                        </span>
                        {insight && (isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                        {!insight && !loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                        {loading && <LoadingSpinner size={16} className="text-white" />}
                    </Button>

                    {stats.recordCount === 0 && (
                        <p className="text-[10px] text-center text-amber-500">
                            Upload a medical record first to generate insights.
                        </p>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}
