'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { StatsWidget } from './StatsWidget';
import { Activity, Heart, Droplets } from 'lucide-react';
import * as THREE from 'three';

// 3D Organic Object (Abstract Medical Resepresentation)
function OrganicShape(props: any) {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.cos(t / 4) / 2;
            meshRef.current.rotation.y = Math.sin(t / 4) / 2;
            meshRef.current.rotation.z = Math.sin(t / 1.5) / 2;
            meshRef.current.position.y = Math.sin(t / 1.5) / 10;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <Sphere args={[1.2, 100, 200]} scale={2} {...props} ref={meshRef}>
                <MeshDistortMaterial
                    color="#4f46e5"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.1}
                    bumpScale={0.005}
                    aoMapIntensity={1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    radius={1}
                />
            </Sphere>
        </Float>
    );
}

// Particles around the shape
function Particles({ count = 100 }: { count?: number }) {
    const mesh = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Generate random particle positions
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;

            // Update time
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;

            // Scale based on "music" or heartbeat could go here
            const s = Math.cos(t);

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            )
            // Contract particles closer to center to look like a cloud/aura
            dummy.position.set(
                Math.cos(t * 0.2) * 4 + (Math.random() - 0.5) * 0.5,
                Math.sin(t * 0.2) * 4 + (Math.random() - 0.5) * 0.5,
                Math.sin(t * 0.2) * 2 + (Math.random() - 0.5) * 0.5
            )

            dummy.scale.set(s, s, s);
            dummy.scale.setScalar(0.05);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();

            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshPhongMaterial color="#06b6d4" emissive="#06b6d4" />
        </instancedMesh>
    )
}


export function HeroSection({ userName }: { userName: string }) {
    return (
        <div className="relative w-full h-[380px] rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-indigo-50/50 via-white/50 to-blue-50/50 border border-white/60 shadow-xl backdrop-blur-sm">
            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
                    <OrganicShape position={[3.5, 0, 0]} />
                    <Particles count={30} />
                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* Foreground Content */}
            <div className="absolute inset-0 z-10 p-8 md:p-12 flex flex-col justify-center max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/50 text-xs font-semibold text-indigo-600 mb-6 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Real-time Health Monitoring
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 mb-4 tracking-tight">
                        Welcome back,<br /> {userName}
                    </h1>

                    <p className="text-lg text-slate-600 max-w-md mb-8 leading-relaxed">
                        Your vitals are stable today. Dr. Smith updated your care plan 2 hours ago.
                    </p>

                    <div className="flex gap-4">
                        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-sm">
                            View Full Repot
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-white/60 font-medium text-slate-700 hover:bg-white/80 transition-all border border-white/40 shadow-sm text-sm">
                            Contact Doctor
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Floating Widgets - Positioned absolutely on the right */}
            <div className="absolute top-1/2 right-12 transform -translate-y-1/2 flex flex-col gap-4 z-10 pointer-events-none md:pointer-events-auto">
                <StatsWidget
                    icon={<Activity className="h-6 w-6" />}
                    label="Heart Rate"
                    value="72"
                    subValue="BPM"
                    color="red"
                    delay={0.2}
                    className="w-56"
                />
                <StatsWidget
                    icon={<Droplets className="h-6 w-6" />}
                    label="Blood Pressure"
                    value="120/80"
                    subValue="mmHg"
                    color="blue"
                    delay={0.4}
                    className="w-64 translate-x-8"
                />
                <StatsWidget
                    icon={<Heart className="h-6 w-6" />}
                    label="Health Score"
                    value="94"
                    subValue="/ 100"
                    color="emerald"
                    delay={0.6}
                    className="w-56"
                />
            </div>
        </div>
    );
}
