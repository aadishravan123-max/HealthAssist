'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';

import { MedicalRecord } from '@/lib/types';

interface ChartDataPoint {
    name: string;
    [key: string]: string | number;
}

export function VitalsChart() {
    const { user } = useAuth();
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [activeTab, setActiveTab] = useState('Hemoglobin');

    useEffect(() => {
        const fetchVitals = async () => {
            if (!user) return;

            const { data: recordsData } = await supabase
                .from('medical_records')
                .select('*')
                .eq('user_id', user.id)
                .eq('record_type', 'lab_test')
                .order('date', { ascending: true }); // Oldest first for chart

            const records = recordsData as MedicalRecord[] | null;

            if (records && records.length > 0) {
                const processedData: ChartDataPoint[] = [];
                const metrics = new Set<string>();

                records.forEach((r) => {
                    if (r.test_results) {
                        const results = typeof r.test_results === 'string'
                            ? JSON.parse(r.test_results)
                            : r.test_results;

                        // Check for specific keys we want to plot
                        // This relies on the keys used in UploadRecordModal/medicalTests.ts
                        const dataPoint: ChartDataPoint = {
                            name: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        };
                        let hasData = false;

                        if (results && typeof results === 'object') {
                            Object.keys(results).forEach(key => {
                                const val = parseFloat(results[key]);
                                if (!isNaN(val)) {
                                    dataPoint[key] = val;
                                    metrics.add(key);
                                    hasData = true;
                                }
                            });
                        }

                        if (hasData) {
                            processedData.push(dataPoint);
                        }
                    }
                });

                if (processedData.length > 0) {
                    setChartData(processedData);
                    if (metrics.has('Hemoglobin')) setActiveTab('Hemoglobin');
                    else if (metrics.size > 0) setActiveTab(Array.from(metrics)[0]);
                }
            }
        };

        fetchVitals();
    }, [user]);

    if (chartData.length === 0) {
        return (
            <div className="p-6 h-[300px] w-full flex items-center justify-center text-muted-foreground text-sm">
                Upload Lab Tests to see your vitals trend here.
            </div>
        );
    }

    return (
        <div className="w-full h-[350px] p-4">
            <div className="flex items-center justify-end mb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-1 h-8 bg-white/50">
                        <TabsTrigger value={activeTab} className="text-xs">{activeTab}</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.3)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey={activeTab}
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorMetric)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
