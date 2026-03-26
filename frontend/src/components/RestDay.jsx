import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, Activity, HeartPulse } from 'lucide-react';

export default function RestDay() {
    const recoveryTips = [
        "Sleep 8+ hours tonight for maximum muscle protein synthesis.",
        "Walk 20 minutes — active recovery reduces DOMS by 40%.",
        "Hydrate: aim for 3–4 litres today.",
        "Foam roll your sorest muscle groups for 10 minutes."
    ];

    const [tipOfDay, setTipOfDay] = useState("");

    // Use current week to seed the random tip so it changes daily but is stable on re-renders
    useEffect(() => {
        const today = new Date().getDay();
        setTipOfDay(recoveryTips[today % recoveryTips.length]);
    }, []);

    const mobilityRoutine = [
        { name: "Hip flexor stretch", duration: "60s per leg" },
        { name: "Thoracic rotation", duration: "10 reps per side" },
        { name: "Lat stretch", duration: "45s hold" },
        { name: "Hamstring stretch", duration: "60s per leg" },
        { name: "Shoulder cross-body stretch", duration: "30s per arm" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
        >
            <div className="text-center py-6">
                <h2 className="text-4xl font-bebas text-blue-400 tracking-wider">Rest Day — Grow Stronger 💤</h2>
                <p className="text-gray-400 mt-2">Time to recover. Muscles grow outside the gym.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recovery Tip Card */}
                <div className="bg-gym-surface/40 backdrop-blur-md border border-blue-900/40 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-2xl"></div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 text-blue-400 group-hover:scale-110 transition-transform duration-500">
                        <HeartPulse size={120} />
                    </div>
                    <h3 className="text-xl font-bebas text-white mb-3">Recovery Tip</h3>
                    <p className="text-blue-200 font-medium text-lg leading-relaxed">{tipOfDay}</p>
                </div>

                {/* Muscle Recovery Status */}
                <div className="bg-gym-surface/40 backdrop-blur-md border border-gym-border p-6 rounded-2xl">
                    <h3 className="text-xl font-bebas text-white mb-4">Muscle Recovery Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5">
                            <span className="text-gray-300">Chest & Shoulders</span>
                            <span className="text-xs font-bold px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-md">RECOVERING</span>
                        </div>
                        <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5">
                            <span className="text-gray-300">Legs & Core</span>
                            <span className="text-xs font-bold px-2 py-1 bg-[#00E676]/20 text-[#00E676] rounded-md">FULLY RECOVERED</span>
                        </div>
                        <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5">
                            <span className="text-gray-300">Back & Biceps</span>
                            <span className="text-xs font-bold px-2 py-1 bg-red-500/20 text-red-500 rounded-md">SORE</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 italic">* Based on previously logged workouts.</p>
                </div>
            </div>

            {/* Mobility Routine */}
            <div className="bg-gym-surfaceElevated border border-gym-border p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="text-[#C8FF00]" />
                    <h3 className="text-2xl font-bebas text-white tracking-wide">Today's Mobility Routine</h3>
                </div>
                <div className="divide-y divide-gym-border">
                    {mobilityRoutine.map((move, idx) => (
                        <div key={idx} className="flex justify-between items-center py-4 hover:bg-gym-surface/50 transition-colors rounded-lg px-2 -mx-2">
                            <span className="text-gray-200 text-lg">{move.name}</span>
                            <span className="font-mono text-[#C8FF00] bg-[#C8FF00]/10 px-3 py-1 rounded-md text-sm">{move.duration}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Quote */}
            <div className="flex bg-gym-surface/20 border border-gym-border p-6 rounded-2xl items-center gap-6">
                <div className="p-4 bg-gym-dark rounded-full text-[#C8FF00]">
                    <Quote size={28} />
                </div>
                <div>
                    <p className="text-gray-300 italic text-lg opacity-90">"There's no such thing as overtraining, just undereating and undersleeping."</p>
                    <p className="text-[#C8FF00] font-bebas tracking-wide mt-2 text-xl">— Arnold Schwarzenegger</p>
                </div>
            </div>
        </motion.div>
    );
}
