import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function PRs() {
    const { token } = useAuthStore();
    const [prs, setPrs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPRs();
    }, [token]);

    const fetchPRs = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/prs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPrs(data);
            } else {
                toast.error("Failed to load PRs");
            }
        } catch (error) {
            toast.error("Network error");
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="pb-12 max-w-5xl mx-auto">
            <header className="mb-10 text-center">
                <h1 className="text-5xl font-bebas text-white tracking-widest drop-shadow-md">
                    Personal Records
                </h1>
                <p className="text-gray-400 mt-2 font-mono text-sm uppercase">Your best performances logged in the system.</p>
            </header>

            {prs.length === 0 ? (
                <div className="text-center py-20 glass-panel max-w-lg mx-auto">
                    <p className="text-5xl mb-4">🏆</p>
                    <p className="text-white font-bold text-xl mb-2">No Personal Records Yet</p>
                    <p className="text-gray-400 font-mono text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                        PRs are automatically tracked when you complete a workout and hit a new max weight or rep count. Start training to earn your first record!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {prs.map((pr) => (
                        <div key={pr.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between group hover:border-[#00E5FF]/40 transition-colors">
                            <div className="mb-4">
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-1 line-clamp-1">{pr.exerciseName}</p>
                                <p className="text-3xl font-bold text-white uppercase truncate">{pr.maxWeight}<span className="text-sm font-mono text-gray-500 ml-1">kg</span></p>
                            </div>

                            <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Max Reps</p>
                                    <p className="text-lg font-bold text-gym-accent">{pr.maxRepsAtWeight}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Achieved</p>
                                    <p className="text-sm font-mono text-gray-300">
                                        {pr.dateAchieved ? new Date(pr.dateAchieved).toLocaleDateString() : '--'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
