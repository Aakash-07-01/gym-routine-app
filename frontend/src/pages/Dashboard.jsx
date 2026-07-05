import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWeeklyInsight, regenerateWeeklyInsight } from '../api/ai';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import MetricsPromptModal from '../components/MetricsPromptModal';

export default function Dashboard() {
    const { user, token, logout } = useAuthStore();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [backendError, setBackendError] = useState(false);

    // Weekly Report
    const [weeklyReport, setWeeklyReport] = useState(null);
    const [showWeeklyModal, setShowWeeklyModal] = useState(false);
    const [showMetricsPrompt, setShowMetricsPrompt] = useState(false);

    // AI Insight
    const [aiInsightData, setAiInsightData] = useState(null);
    const [loadingAi, setLoadingAi] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate('/register');
        } else {
            fetchDashboardStats();
            checkWeeklySummary();
            fetchWeeklyAiInsight();
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
                } else if (res.status === 401 || res.status === 403) {
                    logout();
                }
            } catch (e) { }
        }
    };

    const fetchWeeklyAiInsight = async () => {
        setLoadingAi(true);
        try {
            const res = await getWeeklyInsight();
            setAiInsightData(res.data);
        } catch (e) {
            console.error("Failed to fetch AI insight:", e);
            setAiInsightData(null);
        } finally {
            setLoadingAi(false);
        }
    };

    const handleRegenerateInsight = async () => {
        setLoadingAi(true);
        try {
            const res = await regenerateWeeklyInsight();
            setAiInsightData(res.data);
        } catch (e) {
            console.error("Failed to regenerate AI insight:", e);
        } finally {
            setLoadingAi(false);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            setBackendError(false);
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    logout();
                    return;
                }
                throw new Error('Failed to fetch dashboard metrics');
            }
            const json = await res.json();
            setStats(json);

            // Check for weekly scale check-in
            if (json.daysSinceLastMetricLog === null || json.daysSinceLastMetricLog >= 7) {
                setShowMetricsPrompt(true);
            }
        } catch (err) {
            setBackendError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gym-blue"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="pb-12">

            {/* Backend Error State */}
            {backendError && (
                <div className="glass-panel p-8 mb-8 text-center border border-red-900/30">
                    <p className="text-gray-300 mb-2">Could not connect to the backend server.</p>
                    <p className="text-gray-500 text-sm mb-4">The server might be starting up. Please try again.</p>
                    <button
                        onClick={() => { setLoading(true); fetchDashboardStats(); }}
                        className="bg-gym-blue hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-all"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Weekly Summary Modal */}
            <AnimatePresence>
                {showWeeklyModal && weeklyReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#000]/60 backdrop-blur-xl" onClick={() => setShowWeeklyModal(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative glass-panel p-10 max-w-lg w-full text-center border border-white/20 shadow-[0_0_50px_rgba(0,122,255,0.2)]"
                        >
                            <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Weekly Review</h2>
                            <p className="text-gray-400 font-mono text-xs uppercase mb-8">Performance initialized and verified.</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/5 rounded-xl p-6 border border-white/5 transition-colors hover:border-gym-blue/50">
                                    <p className="text-5xl font-bold text-gym-blue">{weeklyReport.workoutsCompleted}</p>
                                    <p className="text-xs font-mono text-gray-400 mt-2 uppercase">Workouts</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-6 border border-white/5 transition-colors hover:border-gym-accent/50">
                                    <p className="text-5xl font-bold text-gym-accent">{weeklyReport.prsHit}</p>
                                    <p className="text-xs font-mono text-gray-400 mt-2 uppercase">New PRs</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-6 border border-white/5 transition-colors hover:border-gym-red/50 col-span-2">
                                    <p className="text-5xl font-bold text-gym-red">{Math.round(weeklyReport.caloriesBurned)}<span className="text-xl ml-1">kcal</span></p>
                                    <p className="text-xs font-mono text-gray-400 mt-2 uppercase">Cardio Output</p>
                                </div>
                            </div>

                            <button onClick={() => setShowWeeklyModal(false)} className="w-full glass-button font-bold text-lg py-4 uppercase tracking-wide">Continue Training</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <MetricsPromptModal
                isOpen={showMetricsPrompt}
                onClose={() => setShowMetricsPrompt(false)}
                onSuccess={() => fetchDashboardStats()}
            />

            {/* Header */}
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white tracking-tight">
                    Welcome back, <span className="text-gym-blue neon-glow">{user?.fullName || user?.username || 'Athlete'}</span>
                </h1>
                <p className="text-gray-400 mt-2 font-mono text-sm">System ready. Session initialized.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Motivation / AI Insight Card */}
                <div className="glass-panel p-8 relative overflow-hidden group hover:border-gym-blue/30 transition-colors">
                    <div className="absolute top-0 right-0 bg-gym-blue/20 text-gym-blue text-xs font-mono px-3 py-1 rounded-bl-lg border-b border-l border-gym-blue/30 shadow-sm">
                        AI INSIGHT
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">Weekly Insight</h2>
                        {aiInsightData && !loadingAi && (
                            <button 
                                onClick={handleRegenerateInsight}
                                className="text-xs text-gym-blue hover:text-white transition-colors"
                            >
                                Regenerate
                            </button>
                        )}
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors min-h-[100px]">
                        {loadingAi ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-2 bg-white/20 rounded w-full"></div>
                                <div className="h-2 bg-white/20 rounded w-5/6"></div>
                                <div className="h-2 bg-white/20 rounded w-4/6"></div>
                            </div>
                        ) : aiInsightData ? (
                            <>
                                <p className="text-gray-300 font-mono text-sm leading-relaxed">
                                    {aiInsightData.content}
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-300 font-mono text-sm leading-relaxed">
                                Your AI insight will be ready after your first workout this week.
                            </p>
                        )}
                    </div>
                </div>

                {/* Today's Workout Focus */}
                <div className="glass-panel p-8 relative flex flex-col justify-between group hover:border-gym-accent/30 transition-colors">
                    <h2 className="text-xl font-bold text-white mb-2">Current Focus</h2>
                    <div className="flex-1 flex flex-col justify-center my-4">
                        <h3 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {stats?.todaysFocus || "Rest Day"}
                        </h3>
                        <p className="text-gym-accent font-mono text-sm mt-2">Next Session: Automatic</p>
                    </div>
                    <div className="mt-4">
                        <Link to="/training" className="block w-full text-center glass-button font-bold text-lg py-3 rounded-lg uppercase tracking-wide">
                            Enter Workout
                        </Link>
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="flex items-center gap-4 mb-6 mt-12">
                <div className="h-px bg-white/10 flex-1"></div>
                <h2 className="text-sm font-mono text-gray-400 uppercase tracking-widest px-2">Biometrics & Output</h2>
                <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Calories */}
                <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col justify-between group glass-panel-hover">
                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-mono mb-2">Energy Output</p>
                    {stats?.caloriesBurnedToday ? (
                        <p className="text-3xl sm:text-4xl font-bold text-white">{Math.round(stats.caloriesBurnedToday)}<span className="text-sm font-mono text-gray-500 ml-1">kcal</span></p>
                    ) : (
                        <div>
                            <p className="text-lg sm:text-xl font-bold text-gray-600">--</p>
                            <Link to="/training" className="text-[10px] text-gym-accent uppercase font-bold tracking-widest hover:underline mt-1 block">Log Workout</Link>
                        </div>
                    )}
                </div>

                {/* Weight */}
                <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col justify-between group glass-panel-hover">
                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-mono mb-2">Body Weight</p>
                    {stats?.currentWeight ? (
                        <p className="text-3xl sm:text-4xl font-bold text-white">{stats.currentWeight}<span className="text-sm font-mono text-gray-500 ml-1">kg</span></p>
                    ) : (
                        <div>
                            <p className="text-lg sm:text-xl font-bold text-gray-600">--</p>
                            <Link to="/progress" className="text-[10px] text-white uppercase font-bold tracking-widest hover:underline mt-1 block">Log Weight</Link>
                        </div>
                    )}
                </div>

                {/* Body Fat */}
                <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col justify-between group glass-panel-hover">
                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-mono mb-2">Body Fat</p>
                    {stats?.currentBodyFat ? (
                        <p className="text-3xl sm:text-4xl font-bold text-white">{stats.currentBodyFat}<span className="text-lg font-mono text-gray-500 ml-1">%</span></p>
                    ) : (
                        <div>
                            <p className="text-lg sm:text-xl font-bold text-gray-600">--</p>
                            <Link to="/progress" className="text-[10px] text-gym-blue uppercase font-bold tracking-widest hover:underline mt-1 block">Calculate Now</Link>
                        </div>
                    )}
                </div>
            </div>


        </motion.div>
    );
}
