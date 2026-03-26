import { motion } from 'framer-motion';
import useGymStore from '../store/gymStore';
import Confetti from 'react-confetti';

export default function NewWeekModal({ summary }) {
    const clearNewWeekSummary = useGymStore(state => state.clearNewWeekSummary);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Confetti recycle={false} numberOfPieces={800} gravity={0.1} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.8, opacity: 0, rotateX: 20 }} animate={{ scale: 1, opacity: 1, rotateX: 0 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", damping: 20 }} className="relative bg-gym-surfaceElevated border border-[#C8FF00]/30 p-8 sm:p-12 rounded-3xl max-w-lg w-full text-center shadow-[0_30px_60px_rgba(200,255,0,0.2)]" style={{ perspective: 1000 }}>
                <h1 className="text-6xl font-bebas text-[#C8FF00] mb-2 tracking-widest drop-shadow-[0_0_15px_rgba(200,255,0,0.5)]">New Week</h1>
                <p className="text-gray-400 font-mono mb-8">Week of {new Date(summary.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>

                <div className="bg-gym-dark/50 rounded-2xl p-6 border border-gym-border space-y-4 mb-8 text-left">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">✅</span>
                        <div>
                            <p className="text-white font-bold text-lg">{summary.completedCount} workouts completed</p>
                            <p className="text-gray-500 text-sm">Consistency is key</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">💪</span>
                        <div>
                            <p className="text-white font-bold text-lg">Total volume: {summary.totalVolume.toLocaleString()} kg</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">🔥</span>
                        <div>
                            <p className="text-white font-bold text-lg">Streak: {summary.streak} days</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">🏆</span>
                        <div>
                            <p className="text-white font-bold text-lg">PR: {summary.pr}</p>
                        </div>
                    </div>
                </div>

                <button onClick={clearNewWeekSummary} className="w-full bg-[#C8FF00] text-black font-bebas text-2xl tracking-widest py-4 rounded-xl hover:bg-[#a6d900] active:scale-95 transition-all shadow-[0_0_20px_rgba(200,255,0,0.4)]">
                    Start New Week &rarr;
                </button>
            </motion.div>
        </div>
    );
}
