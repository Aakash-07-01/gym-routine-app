import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Edit3 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Notes() {
    const { token } = useAuthStore();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [content, setContent] = useState('');
    const [energyLevel, setEnergyLevel] = useState(3);

    useEffect(() => {
        fetchNotes();
    }, [token]);

    const fetchNotes = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/notes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setNotes(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content, energyLevel })
            });

            if (res.ok) {
                const newNote = await res.json();
                toast.success("Note Analyzed and Logged!", { icon: '🤖' });
                setContent('');
                setEnergyLevel(3);
                setNotes([newNote, ...notes]);
            } else {
                toast.error("Failed to save note");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 max-w-4xl mx-auto pb-20">
            <header className="flex justify-between items-end mb-4 border-b-2 border-[#222] pb-6">
                <div>
                    <h1 className="text-5xl font-bebas text-white tracking-widest uppercase drop-shadow-md">Daily Check-in</h1>
                    <p className="text-gray-400 mt-2 font-mono tracking-widest text-sm uppercase flex items-center gap-2">
                        <Cpu size={16} className="text-[#FF0055]" /> AI Engine Active
                    </p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="card-3d bg-[#111] p-8 border-l-[#FF0055]/50 border-t-[#FF0055]/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-[#FF0055] text-white font-bebas tracking-widest text-sm px-4 py-1 rounded-bl-xl shadow-[0_0_15px_rgba(255,0,85,0.6)] z-10">
                    LOG
                </div>

                <div className="mb-6">
                    <label className="text-xs text-[#FF0055] font-bold uppercase tracking-widest mb-3 block">Energy Level: {energyLevel}/5</label>
                    <input type="range" min="1" max="5" value={energyLevel} onChange={e => setEnergyLevel(Number(e.target.value))} className="w-full h-2 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#FF0055]" />
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-2 uppercase">
                        <span>Exhausted</span>
                        <span>Peaking</span>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3 block flex items-center gap-2">
                        <Edit3 size={14} /> Training Journal
                    </label>
                    <textarea
                        rows="4"
                        required
                        placeholder="How did you feel today? Any soreness, stress, or PRs?"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#FF0055] font-mono resize-none transition-colors"
                    />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full mt-6 btn-3d-pink text-white font-bebas text-2xl tracking-widest py-4 rounded-xl transition-transform uppercase disabled:opacity-50 flex items-center justify-center gap-2 text-black">
                    {isSubmitting ? 'Analyzing...' : 'SUBMIT FOR ANALYSIS'}
                </button>
            </form>

            <div className="space-y-6">
                <h2 className="text-3xl font-bebas text-white tracking-widest uppercase">Analysis History</h2>

                {loading ? (
                    <div className="animate-spin h-6 w-6 border-t-2 border-[#FF0055] rounded-full mx-auto mt-10" />
                ) : notes.length === 0 ? (
                    <p className="text-center text-gray-500 font-mono uppercase text-sm py-10">No notes found.</p>
                ) : (
                    <AnimatePresence>
                        {notes.map((note) => (
                            <motion.div key={note.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-3d bg-[#111] p-6 border-[#222]">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs text-gray-500 font-mono tracking-widest uppercase">{new Date(note.date).toLocaleString()}</span>
                                    <span className={`text-xs px-2 py-1 rounded font-mono font-bold ${note.energyLevel >= 4 ? 'bg-[#C8FF00]/10 text-[#C8FF00]' : note.energyLevel <= 2 ? 'bg-[#FF0055]/10 text-[#FF0055]' : 'bg-gray-800 text-gray-300'}`}>
                                        NRG {note.energyLevel}/5
                                    </span>
                                </div>
                                <p className="text-white font-mono text-sm leading-relaxed mb-4">{note.content}</p>

                                {note.aiInsight && (
                                    <div className="bg-[#1a1a1a] border-l-2 border-[#FF0055] p-4 rounded-r-lg">
                                        <p className="text-xs text-[#FF0055] font-bold uppercase tracking-widest mb-1 flex items-center gap-2"><Cpu size={12} /> Analysis</p>
                                        <p className="text-gray-300 font-mono text-xs">{note.aiInsight.replace('AI Insight: ', '')}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}
