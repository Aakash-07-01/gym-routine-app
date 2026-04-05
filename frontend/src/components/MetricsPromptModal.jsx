import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Activity, Scale } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function MetricsPromptModal({ isOpen, onClose, onSuccess }) {
    const { token } = useAuthStore();
    const [weight, setWeight] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!weight || Number(weight) <= 0) {
            toast.error("Please enter a valid body weight");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                bodyWeight: parseFloat(weight),
                bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : null,
                measurementMethod: "User Input"
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://gym-routine-backend.onrender.com' : 'http://localhost:8080')}/api/metrics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Biometrics Synced!", {
                    icon: '✅',
                    style: { borderRadius: '10px', background: '#34c759', color: '#fff', fontWeight: 'bold' },
                });
                onSuccess();
                onClose();
            } else {
                toast.error("Failed to sync metrics");
            }
        } catch (err) {
            toast.error("Network error saving metrics");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#000]/80 backdrop-blur-xl" />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative glass-panel p-8 sm:p-10 max-w-md w-full border-gym-blue/50 shadow-[0_0_40px_rgba(0,122,255,0.2)]"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gym-blue/20 flex items-center justify-center text-gym-blue shadow-[0_0_15px_rgba(0,122,255,0.4)]">
                        <Activity size={32} />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white text-center mb-3">Weekly Check-in</h2>
                <p className="text-gray-400 text-center text-sm font-mono leading-relaxed mb-8">
                    To maintain accurate AI progressive overload tracking, please update your current body metrics.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest px-2 mb-2">
                            Body Weight (kg) *
                        </label>
                        <div className="relative">
                            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                required
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-lg font-bold font-mono outline-none focus:border-gym-primary transition-all hover:bg-white/5"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest px-2 mb-2 flex justify-between">
                            <span>Body Fat (%)</span>
                            <span className="text-gray-600">Optional</span>
                        </label>
                        <div className="relative">
                            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="number"
                                step="0.1"
                                placeholder="--"
                                value={bodyFat}
                                onChange={(e) => setBodyFat(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-lg font-bold font-mono outline-none focus:border-gym-accent transition-all hover:bg-white/5"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full glass-button bg-gym-blue/20 hover:bg-gym-blue/30 text-white font-bold text-lg py-4 rounded-xl uppercase tracking-widest transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_0_20px_rgba(0,122,255,0.3)]'}`}
                        >
                            {submitting ? 'Syncing...' : 'Sync Metrics'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="text-gray-500 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors"
                        title="Skip this week if you don't have a scale"
                    >
                        Skip for now
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
