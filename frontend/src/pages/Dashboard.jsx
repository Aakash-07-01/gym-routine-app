import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user, token, logout } = useAuthStore();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Weekly Report
    const [weeklyReport, setWeeklyReport] = useState(null);
    const [showWeeklyModal, setShowWeeklyModal] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/register');
        } else {
            fetchDashboardStats();
            checkWeeklySummary();
        }
    }, [token, navigate]);

    const checkWeeklySummary = async () => {
        // Only trigger on Sundays (0)
        if (new Date().getDay() !== 0) return;

        const lastSeen = localStorage.getItem('gymjam_weekly_seen');
        const todayStr = new Date().toISOString().split('T')[0];

        if (lastSeen !== todayStr) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/dashboard/weekly`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setWeeklyReport(await res.json());
                    setShowWeeklyModal(true);
                    localStorage.setItem('gymjam_weekly_seen', todayStr);
                }
            } catch (e) { }
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
            const json = await res.json();
            setStats(json);
        } catch (err) {
            toast.error("Could not load backend metrics.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00E5FF]"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24">

            {/* Weekly Summary Modal */}
            <AnimatePresence>
                {showWeeklyModal && weeklyReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowWeeklyModal(false)} />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
                            className="relative bg-[#111] p-10 max-w-lg w-full text-center border-t-4 border-t-[#C8FF00] border-l-4 border-l-[#C8FF00] shadow-[10px_10px_0_0_#C8FF00] rounded-xl"
                        >
                            <h2 className="text-6xl font-bebas text-white uppercase tracking-widest leading-none drop-shadow-md">Sunday Recap</h2>
                            <p className="text-gray-400 font-mono text-sm tracking-widest uppercase mt-4 mb-8">Performance initialized and verified.</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-[#1a1a1a] p-6 border-b-2 border-[#C8FF00]">
                                    <p className="text-5xl font-bebas text-[#C8FF00]">{weeklyReport.workoutsCompleted}</p>
                                    <p className="text-xs font-mono text-gray-400 mt-2 uppercase">Workouts</p>
                                </div>
                                <div className="bg-[#1a1a1a] p-6 border-b-2 border-[#00E5FF]">
                                    <p className="text-5xl font-bebas text-[#00E5FF]">{weeklyReport.prsHit}</p>
                                    <p className="text-xs font-mono text-gray-400 mt-2 uppercase">New PRs</p>
                                </div>
                                <div className="bg-[#1a1a1a] p-6 border-b-2 border-[#FF0055] col-span-2">
                                    <p className="text-5xl font-bebas text-[#FF0055]">{Math.round(weeklyReport.caloriesBurned)}<span className="text-xl">kcal</span></p>
                                    <p className="text-xs font-mono text-gray-400 mt-2 uppercase">Cardio Calories Banished</p>
                                </div>
                            </div>

                            <button onClick={() => setShowWeeklyModal(false)} className="w-full btn-3d-cyan text-black font-bebas text-3xl tracking-widest py-4 uppercase">Continue Training</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="flex justify-between items-end mb-4 border-b-2 border-[#222] pb-6">
                <div>
                    <h1 className="text-5xl font-bebas text-white tracking-widest uppercase drop-shadow-md">
                        Welcome back, <span className="text-[#00E5FF]">{user?.fullName || user?.username || 'Athlete'}</span>
                    </h1>
                    <p className="text-gray-400 mt-2 font-mono tracking-widest text-sm uppercase">Engine Calibrated. Ready for Session.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Motivation / AI Insight Card */}
                <div className="card-3d p-8 relative overflow-hidden bg-[#111] border-l-[#FF0055]/50 border-t-[#FF0055]/50 group">
                    <div className="absolute top-0 right-0 bg-[#FF0055] text-white font-bebas tracking-widest text-sm px-4 py-1 rounded-bl-xl shadow-[0_0_15px_rgba(255,0,85,0.6)]">
                        AI INSIGHT
                    </div>
                    <h2 className="text-3xl font-bebas tracking-widest text-white mb-6">Daily Analysis</h2>
                    <div className="p-5 card-3d-item border-[#222]">
                        <p className="text-gray-300 font-mono text-sm leading-relaxed tracking-wide">
                            {stats?.aiInsight ? stats.aiInsight : "You haven't logged any notes recently. Track your energy to generate insights."}
                        </p>
                    </div>
                    {!stats?.aiInsight && (
                        <Link to="/notes" className="inline-block mt-4 text-[#FF0055] hover:text-white font-bebas text-xl tracking-widest uppercase transition-colors">
                            Log a Note ➔
                        </Link>
                    )}
                </div>

                {/* Today's Workout Focus */}
                <div className="card-3d p-8 relative overflow-hidden bg-[#111] border-l-[#00E5FF]/50 border-t-[#00E5FF]/50 group">
                    <h2 className="text-3xl font-bebas tracking-widest text-white mb-6">Current Focus</h2>
                    <div className="flex flex-col h-full justify-between pb-8">
                        <div className="space-y-4">
                            <h3 className="text-4xl font-bebas uppercase text-[#00E5FF] tracking-widest drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                                {stats?.todaysFocus || "Rest Day"}
                            </h3>
                            <p className="text-gray-400 font-mono text-sm">Next Session: Automatic</p>
                        </div>
                        <div className="mt-8">
                            <Link to="/routine" className="block w-full text-center btn-3d-cyan text-black font-bebas text-2xl tracking-widest py-4 rounded-xl uppercase">
                                ENTER WORKOUT
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <h2 className="text-4xl font-bebas text-white tracking-widest mt-12 mb-6 uppercase border-b-2 border-[#222] pb-4">Biometrics & Output</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                {/* Calories */}
                <div className="card-3d-item p-6 rounded-[2rem] hover:-translate-y-1 transition-transform border-[#333]">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3 block">Energy Output</p>
                    {stats?.caloriesBurnedToday ? (
                        <p className="text-5xl font-bebas text-[#C8FF00]">{Math.round(stats.caloriesBurnedToday)}<span className="text-sm font-mono text-gray-500 ml-1">kcal</span></p>
                    ) : (
                        <div className="h-full flex flex-col justify-end">
                            <p className="text-xl font-bebas text-gray-600 tracking-widest">No Data</p>
                            <Link to="/routine" className="text-[10px] text-[#C8FF00] uppercase font-bold tracking-widest hover:underline mt-1 block">Log Workout</Link>
                        </div>
                    )}
                </div>

                {/* Weight */}
                <div className="card-3d-item p-6 rounded-[2rem] hover:-translate-y-1 transition-transform border-[#333]">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3 block">Body Weight</p>
                    {stats?.currentWeight ? (
                        <p className="text-5xl font-bebas text-white">{stats.currentWeight}<span className="text-sm font-mono text-gray-500 ml-1">kg</span></p>
                    ) : (
                        <div className="h-full flex flex-col justify-end">
                            <p className="text-xl font-bebas text-gray-600 tracking-widest">No Data</p>
                            <Link to="/progress" className="text-[10px] text-white uppercase font-bold tracking-widest hover:underline mt-1 block">Log Weight</Link>
                        </div>
                    )}
                </div>

                {/* Body Fat */}
                <div className="card-3d-item p-6 rounded-[2rem] hover:-translate-y-1 transition-transform border-[#333]">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3 block">Body Fat</p>
                    {stats?.currentBodyFat ? (
                        <p className="text-5xl font-bebas text-[#00E5FF]">{stats.currentBodyFat}<span className="text-lg font-mono text-[#00E5FF] ml-1">%</span></p>
                    ) : (
                        <div className="h-full flex flex-col justify-end">
                            <p className="text-xl font-bebas text-gray-600 tracking-widest">No Data</p>
                            <Link to="/progress" className="text-[10px] text-[#00E5FF] uppercase font-bold tracking-widest hover:underline mt-1 block">Calculate Now</Link>
                        </div>
                    )}
                </div>

                {/* PRs */}
                <div className="card-3d-item p-6 rounded-[2rem] hover:-translate-y-1 transition-transform border-[#333]">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3 block">Active PRs</p>
                    {stats?.activePRs > 0 ? (
                        <p className="text-5xl font-bebas text-[#FF0055]">{stats.activePRs}<span className="text-sm text-[#FF0055] ml-2">👑</span></p>
                    ) : (
                        <div className="h-full flex flex-col justify-end">
                            <p className="text-xl font-bebas text-gray-600 tracking-widest">No Data</p>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1 block">Keep Pushing</p>
                        </div>
                    )}
                </div>

            </div>
        </motion.div>
    );
}
