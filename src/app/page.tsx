'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Activity, Shield, Users, ArrowRight, HeartPulse, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-medical-bg overflow-x-hidden relative">
      {/* Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px]" />
        <div className="absolute top-[20%] right-[-100px] w-[600px] h-[600px] rounded-full bg-teal-400/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center shadow-lg shadow-medical-primary/20">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medical-primary to-teal-600">
            HealthAssist
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-foreground hover:bg-white/50">
              Log In
            </Button>
          </Link>
          <Link href="/login?mode=signup">
            <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white shadow-lg shadow-medical-primary/25 rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-medical-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-medical-primary tracking-wide uppercase">AI-Powered Healthcare</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Your Health, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-primary to-teal-500">
                Reimagined.
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Experience the future of medical care with our AI-integrated platform.
              Seamlessly connect with doctors, manage records, and get instant health insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg shadow-2xl shadow-slate-900/20 group">
                  I am a Patient
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login?role=doctor" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-14 bg-white/50 hover:bg-white border-slate-200 text-slate-900 rounded-2xl text-lg backdrop-blur-sm">
                  I am a Doctor
                </Button>
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>10k+ Users</span>
              </div>
            </div>
          </div>

          <div className="relative animate-in slide-in-from-right duration-1000 delay-200">
            {/* Abstract UI Mockup Composition */}
            <div className="relative">
              {/* Back Card */}
              <GlassCard className="absolute top-[-20px] right-[-20px] w-full h-full rotate-6 opacity-60 z-0 bg-blue-100/50">
                <div />
              </GlassCard>

              {/* Main Card */}
              <GlassCard className="relative z-10 w-full aspect-[4/3] flex items-center justify-center overflow-hidden border-2 border-white/50 shadow-2xl shadow-blue-900/10 !bg-white/40 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />

                <div className="relative z-20 text-center space-y-4 max-w-sm">
                  <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center shadow-lg">
                    <Stethoscope className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900">HealthAssist AI</h3>
                  <p className="text-slate-600">The most advanced medical dashboard for modern healthcare professionals.</p>

                  <div className="flex justify-center gap-2 pt-4">
                    <div className="h-2 w-2 rounded-full bg-slate-300" />
                    <div className="h-2 w-2 rounded-full bg-slate-300" />
                    <div className="h-2 w-8 rounded-full bg-blue-500" />
                  </div>
                </div>
              </GlassCard>

              {/* Floating Element */}
              <motion.div className="absolute -bottom-10 -left-10 z-30">
                <GlassCard className="p-4 flex items-center gap-3 !bg-white/90 shadow-xl border-green-100">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Vitals Status</p>
                    <p className="text-sm font-bold text-slate-900">Normal</p>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
