'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, User, Bot, Loader2, Sparkles, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyzeMedicalTextAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AIChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your AI Health Assistant. How can I help you today with your health or medical questions?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const historyContext = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
            const response = await analyzeMedicalTextAction(userMessage, historyContext);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative h-[calc(100vh-140px)] flex flex-col rounded-3xl overflow-hidden border border-white/40 bg-white/40 backdrop-blur-xl shadow-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] -z-10" />

            {/* Header */}
            <div className="px-6 py-4 border-b border-white/20 bg-white/30 backdrop-blur-md flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                            <Bot className="h-5 w-5" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
                        </span>
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">AI Health Assistant</h2>
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-indigo-500" />
                            <span className="text-xs font-medium text-slate-500">Powered by Gemini Medical AI</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                                "flex w-full",
                                message.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "flex max-w-[85%] md:max-w-[75%] gap-3",
                                message.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}>
                                {/* Avatar */}
                                <div className={cn(
                                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md mt-1",
                                    message.role === 'user'
                                        ? "bg-slate-800 text-white"
                                        : "bg-white text-indigo-600"
                                )}>
                                    {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>

                                {/* Bubble */}
                                <div className={cn(
                                    "p-4 rounded-2xl shadow-sm text-sm leading-relaxed relative overflow-hidden",
                                    message.role === 'user'
                                        ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-sm"
                                        : "bg-white/80 backdrop-blur-md text-slate-700 border border-white/40 rounded-tl-sm"
                                )}>
                                    {message.role === 'user' ? (
                                        <p className="whitespace-pre-wrap font-medium">{message.content}</p>
                                    ) : (
                                        <div className="markdown-content text-slate-700">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2 space-y-1 marker:text-indigo-500" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-2 space-y-1 marker:text-indigo-500" {...props} />,
                                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                    p: ({ node, ...props }) => <p className="mb-3 last:mb-0 text-slate-700" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                                                    h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2 mt-4 text-slate-900 border-b border-slate-200 pb-1" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2 mt-3 text-slate-800" {...props} />,
                                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-200 pl-4 py-1 my-2 bg-indigo-50/50 italic text-slate-600 rounded-r" {...props} />,
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start w-full"
                    >
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-white text-indigo-600 shadow-sm flex items-center justify-center mt-1">
                                <Bot size={14} />
                            </div>
                            <div className="bg-white/60 backdrop-blur-sm border border-white/40 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                                </div>
                                <span className="text-xs font-medium text-slate-400 ml-1">Analyzing...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={scrollRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 pt-2 z-10">
                <GlassCard className="p-2 flex gap-2 items-center bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-2xl">
                    <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors hidden sm:block">
                        <Plus className="h-5 w-5" />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe your symptoms or ask a medical question..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 text-sm md:text-base px-2"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !input.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 active:scale-95 group"
                    >
                        {isLoading ? <LoadingSpinner size={20} className="text-white/80" /> : <Send className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />}
                    </button>
                </GlassCard>
                <p className="text-center text-[10px] text-slate-400 mt-3">
                    AI can make mistakes. Please verify important medical information with a doctor.
                </p>
            </div>
        </div>
    );
}
