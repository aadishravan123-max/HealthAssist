'use server';

import { analyzeMedicalText } from '@/lib/ai/gemini';
import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MedicalRecord {
    id: string;
    record_type: 'lab_test' | 'prescription';
    date: string;
    doctor_name?: string;
    test_name?: string;
    test_category?: string;
    test_results?: Record<string, unknown>;
    prescription_text?: string;
}

async function getMedicalRecordsContext(userId: string): Promise<string> {
    try {
        const { data: records, error } = await supabase
            .from('medical_records')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(10); // Get last 10 records for context

        if (error || !records || records.length === 0) {
            return '';
        }

        const formattedRecords = records.map((record: MedicalRecord) => {
            if (record.record_type === 'lab_test') {
                let testInfo = `Lab Test: ${record.test_name || 'Unknown'} (${record.test_category || 'General'}) - Date: ${record.date}`;
                if (record.test_results && typeof record.test_results === 'object') {
                    const results = Object.entries(record.test_results)
                        .map(([key, value]) => `  - ${key}: ${value}`)
                        .join('\n');
                    testInfo += `\nResults:\n${results}`;
                }
                return testInfo;
            } else if (record.record_type === 'prescription') {
                return `Prescription from Dr. ${record.doctor_name || 'Unknown'} - Date: ${record.date}\n${record.prescription_text || 'No details'}`;
            }
            return '';
        }).filter(Boolean);

        if (formattedRecords.length === 0) return '';

        return `\n--- PATIENT MEDICAL RECORDS ---\n${formattedRecords.join('\n\n')}\n--- END MEDICAL RECORDS ---\n`;
    } catch (error) {
        console.error('Error fetching medical records:', error);
        return '';
    }
}

export async function analyzeMedicalTextAction(prompt: string, historyContext?: string, userId?: string) {
    try {
        let fullPrompt = prompt;

        // Add medical records context if userId is provided
        let medicalContext = '';
        if (userId) {
            medicalContext = await getMedicalRecordsContext(userId);
        }

        if (historyContext || medicalContext) {
            fullPrompt = `${medicalContext ? 'Patient Medical History:' + medicalContext + '\n' : ''}${historyContext ? 'Conversation Context:\n' + historyContext + '\n\n' : ''}User Query: ${prompt}`;
        }

        const response = await analyzeMedicalText(fullPrompt);
        return response;
    } catch (error) {
        console.error('Server Action Error:', error);
        return "I apologize, but I'm having trouble connecting to my brain right now. Please try again later.";
    }
}
