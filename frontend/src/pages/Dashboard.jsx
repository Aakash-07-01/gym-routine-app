import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useGymStore from '../store/gymStore';

export default function Dashboard() {
    const user = useAuthStore(state => state.user);
    const { activeSplitId, splits, workoutLog } = useGymStore();

    const activeSplit = splits.find(s => s.id === activeSplitId) || null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const completedDaysThisWeek = workoutLog.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startOfWeek;
    }).length;

    const totalDays = activeSplit ? activeSplit.days.length : 7;
    const completedDays = Math.min(completedDaysThisWeek, totalDays);
    const todaysDay = activeSplit ? activeSplit.days[completedDays % activeSplit.days.length] : null;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = workoutLog.find(l => l.date === todayStr);
    const isLocked = !!todayLog;

    const data = [
        { name: 'Completed', value: completedDays },
        { name: 'Remaining', value: Math.max(0, totalDays - completedDays) },
    ];
    // Using GymOS V4 Aesthetics
    const COLORS = ['#C8FF00', '#222222'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 max-w-4xl mx-auto"
        >
            <header className="flex justify-between items-end mb-4 block">
                <div>
                    <h1 className="text-4xl font-bebas text-white tracking-wide">Welcome back, {user?.username || 'Athlete'}</h1>
                    <p className="text-gray-400 mt-1">{"Let's crush today's goals."}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Today's Workout Card with 3D Tilt */}
                <div className={`transform perspective-[1000px] hover:rotate-x-2 hover:rotate-y-2 transition-transform duration-500 bg-gym-surfaceElevated border p-6 rounded-2xl shadow-xl relative overflow-hidden ${isLocked ? 'border-[#00E676] shadow-[0_0_20px_rgba(0,230,118,0.15)] bg-opacity-90 backdrop-blur-md' : 'border-gym-border'}`}>

                    {isLocked && (
                        <div className="absolute top-0 right-0 bg-[#00E676] text-black font-bebas tracking-widest text-lg px-4 py-1 rounded-bl-xl z-10 shadow-lg">
                            COMPLETED
                        </div>
                    )}

                    <h2 className="text-2xl font-bebas tracking-wide text-white mb-6">Today's Focus</h2>
                    {activeSplit && todaysDay ? (
                        <div className="space-y-6">
                            <div className="p-5 bg-gym-surface rounded-xl border border-gym-border relative overflow-hidden group">
                                {/* Subtle inner glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C8FF00]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <h3 className="text-xl font-bold uppercase text-[#C8FF00] tracking-wide">{todaysDay.name}</h3>
                                <p className="text-gray-400 text-sm mt-1">{activeSplit.name}</p>

                                {isLocked && (
                                    <div className="mt-4 pt-4 border-t border-[#00E676]/30 flex items-center justify-between">
                                        <p className="text-[#00E676] font-mono text-sm">Completed at {new Date(todayLog.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <div className="w-2 h-2 rounded-full bg-[#00E676] shadow-[0_0_8px_#00E676]"></div>
                                    </div>
                                )}
                            </div>

                            <Link
                                to="/routine"
                                className={`block w-full text-center font-bold tracking-wide py-4 rounded-xl transition-all ${isLocked ? 'bg-gym-surface border border-gym-border text-[#00E676] hover:bg-gym-gray' : 'bg-[#C8FF00] hover:bg-[#a6d900] text-black shadow-[0_4px_15px_rgba(200,255,0,0.3)] hover:shadow-[0_6px_20px_rgba(200,255,0,0.5)] transform active:scale-95'}`}
                            >
                                {isLocked ? "SEE TODAY'S SESSION" : "START WORKOUT"}
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gym-surface rounded-xl border border-gym-border">
                            <p className="text-gray-400 mb-4">No active routine found.</p>
                            <Link to="/splits" className="text-[#C8FF00] hover:underline font-bold uppercase tracking-wide">
                                Browse Templates
                            </Link>
                        </div>
                    )}
                </div>

                {/* Weekly Progress Ring 3D */}
                <div className="bg-gym-surface/20 backdrop-blur-xl border border-gym-border p-6 rounded-2xl shadow-xl flex flex-col items-center">
                    <h2 className="text-2xl font-bebas tracking-wide text-white w-full">Weekly Streak</h2>
                    <div className="h-48 w-full mt-6 relative drop-shadow-[0_10px_10px_rgba(200,255,0,0.2)]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    stroke="none"
                                    cornerRadius={8}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bebas text-white tracking-wider">{completedDays}<span className="text-[#C8FF00]">/</span>{totalDays}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">Days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row - Glassmorphism */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Streak</p>
                    <p className="text-3xl font-mono text-white">4 <span className="text-sm text-[#FF6B00]">🔥</span></p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Total Vol</p>
                    <p className="text-3xl font-mono text-white">12.4<span className="text-sm text-gray-400">t</span></p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Sessions</p>
                    <p className="text-3xl font-mono text-white">{workoutLog.length}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Next Rest</p>
                    <p className="text-3xl font-mono text-[#00E676]">Sun</p>
                </div>
            </div>
        </motion.div>
    );
}
