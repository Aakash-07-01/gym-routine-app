import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function CardioPromptModal({ isOpen, onClose }) {
    const { user, token } = useAuthStore();

    // Smart duration default based on goal
    let suggestedDuration = 20;
    if (user?.primaryGoal === 'Fat Loss') suggestedDuration = 30;
    if (user?.primaryGoal === 'Muscle Gain') suggestedDuration = 10;
    if (user?.primaryGoal === 'Athletic Performance') suggestedDuration = 25;

    const [duration, setDuration] = useState(suggestedDuration);
    const [type, setType] = useState('Running');
    const [intensity, setIntensity] = useState('Moderate');
    const [customType, setCustomType] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const presetTypes = ['Running', 'Walking', 'Cycling', 'Jump Rope', 'Rowing', 'Swimming', 'Stair Climber', 'HIIT', 'Other'];

    if (!isOpen) return null;

    const handleSave = async () => {
        const finalType = type === 'Other' ? customType : type;
        if (!finalType) {
            toast.error("Please enter a cardio type");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('http://localhost:8080/api/cardio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: finalType,
                    durationMinutes: duration,
                    intensity: intensity
                })
            });

            if (!res.ok) throw new Error("Failed to save cardio");
            const data = await res.json();

            toast.success(`Cardio logged! Est. ${Math.round(data.estimatedCaloriesBurned)} kcal burned.`, { icon: '🔥' });
            onClose();
        } catch (error) {
            toast.error("Error saving cardio data");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" />

                <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative card-3d p-8 max-w-lg w-full bg-[#111] border-l-[#00E5FF]/50 border-t-[#00E5FF]/50 shadow-[0_20px_50px_rgba(0,229,255,0.2)]">

                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white bg-black p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>

                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-[#00E5FF]/10 rounded-full border border-[#00E5FF]/30">
                            <Activity size={40} className="text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                        </div>
                    </div>

                    <h2 className="text-4xl font-bebas text-white tracking-widest text-center mb-2 uppercase">Great Work!</h2>
                    <p className="text-gray-400 font-mono text-sm text-center mb-8">Would you like to add some cardio today?</p>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Cardio Type</label>
                            <select className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono appearance-none" value={type} onChange={(e) => setType(e.target.value)}>
                                {presetTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                            </select>
                            {type === 'Other' && (
                                <input type="text" placeholder="Specify type..." className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono mt-3" value={customType} onChange={e => setCustomType(e.target.value)} />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-[#00E5FF] font-bold uppercase tracking-widest mb-2 block">Duration (Mins)</label>
                                <input type="number" min="1" className="w-full bg-[#00E5FF]/5 border-2 border-[#00E5FF]/50 rounded-xl px-4 py-3 text-[#00E5FF] focus:outline-none focus:border-[#00e5ff] font-bebas text-2xl tracking-widest shadow-[0_0_10px_rgba(0,229,255,0.1)]" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
                                <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest text-center">Suggested for {user?.primaryGoal || 'you'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">Intensity</label>
                                <select className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono appearance-none h-[56px]" value={intensity} onChange={(e) => setIntensity(e.target.value)}>
                                    <option>Low</option>
                                    <option>Moderate</option>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-10">
                        <button onClick={onClose} className="px-6 py-4 bg-transparent border-2 border-[#333] text-gray-400 font-bebas text-xl tracking-widest hover:bg-[#222] hover:text-white transition-colors rounded-xl uppercase">
                            Skip
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="flex-1 btn-3d-cyan text-black font-bebas text-2xl tracking-widest py-4 rounded-xl transition-transform uppercase disabled:opacity-50">
                            {isSaving ? 'Logging...' : 'Log Cardio'}
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
