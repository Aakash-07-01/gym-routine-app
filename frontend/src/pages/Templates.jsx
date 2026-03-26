import { useState } from 'react';
import useGymStore from '../store/gymStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Copy, Edit2, Trash2 } from 'lucide-react';

export default function Templates() {
    const { splits, setActiveSplitId, deleteCustomSplit } = useGymStore();
    const navigate = useNavigate();
    const [loadingId, setLoadingId] = useState(null);
    const [flippedId, setFlippedId] = useState(null);

    const defaultSplits = splits.filter(s => s.isDefault);
    const customSplits = splits.filter(s => !s.isDefault);

    const handleUseSplit = (templateId) => {
        setLoadingId(templateId);
        setTimeout(() => {
            setActiveSplitId(templateId);
            toast.success('Successfully loaded routine!', { icon: '📋' });
            navigate('/routine');
        }, 600);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Delete this custom split?')) {
            deleteCustomSplit(id);
            toast.success('Split deleted.');
        }
    };

    const renderSplitCard = (split) => {
        const isFlipped = flippedId === split.id;
        return (
            <motion.div
                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                key={split.id}
                className="group perspective-[1000px] h-[360px] w-full cursor-pointer mt-4"
                onClick={() => setFlippedId(isFlipped ? null : split.id)}
            >
                <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.7, type: "spring", stiffness: 150, damping: 20 }}
                    className="w-full h-full relative preserve-3d"
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-gym-surfaceElevated border border-gym-border/30 p-6 rounded-[2rem] shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:border-[#C8FF00]/50 transition-all flex flex-col justify-between overflow-hidden group-hover:-translate-y-2 duration-300 backdrop-blur-sm">
                        <div className="absolute -right-6 -bottom-6 text-[220px] font-bebas text-white/[0.03] select-none leading-none pointer-events-none drop-shadow-md">
                            {split.days.length}
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-4xl font-bebas tracking-wide text-white group-hover:text-[#C8FF00] transition-colors drop-shadow-sm">{split.name}</h3>
                                <span className="bg-gym-dark text-[#C8FF00] px-3 py-1.5 rounded-full text-[10px] font-bold font-mono border border-gym-border shadow-inner uppercase">
                                    {split.days.length} DAYS
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed relative z-10 font-medium">{split.isDefault ? 'Expert preset schedule built for maximum gains and perfect recovery.' : 'Your personalized custom workout routine.'}</p>
                        </div>
                        <div className="mt-auto relative z-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 group-hover:text-white transition-colors">
                            Tap to flip <span className="text-lg">↺</span>
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden bg-gym-surfaceElevated border border-[#C8FF00] p-6 rounded-[2rem] shadow-[0_0_40px_rgba(200,255,0,0.15)] flex flex-col justify-between" style={{ transform: 'rotateY(180deg)' }}>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bebas tracking-wide text-[#C8FF00] mb-4 border-b border-[#C8FF00]/20 pb-2">Day Breakdown</h3>
                            <div className="space-y-2 mb-4 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                                {split.days.map((d, i) => (
                                    <div key={d.id} className="text-sm pb-1 flex justify-between items-end border-b border-gym-border/50 border-dashed">
                                        <span className="text-gray-200 font-medium">{d.name}</span>
                                        <span className="text-gray-500 font-mono text-[10px] uppercase">{d.exercises.length} ex</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 mt-auto relative z-20" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => handleUseSplit(split.id)}
                                disabled={loadingId === split.id}
                                className="w-full bg-[#C8FF00] hover:bg-[#a6d900] active:scale-95 disabled:opacity-50 text-black font-bebas text-2xl tracking-widest py-3 rounded-xl transition-all shadow-[0_5px_15px_rgba(200,255,0,0.3)]"
                            >
                                {loadingId === split.id ? 'LOADING...' : 'USE THIS ROUTINE'}
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                {split.isDefault ? (
                                    <button onClick={() => navigate(`/builder/${split.id}`)} className="col-span-2 flex items-center justify-center gap-2 bg-gym-dark hover:bg-gym-border text-white py-2.5 rounded-xl text-[10px] font-bold font-mono tracking-widest uppercase transition-colors">
                                        <Copy size={14} /> Duplicate Template
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => navigate(`/builder/${split.id}`)} className="flex items-center justify-center gap-2 bg-gym-dark hover:bg-gym-border text-white py-2.5 rounded-xl text-[10px] font-bold font-mono tracking-widest uppercase transition-colors">
                                            <Edit2 size={14} /> Edit
                                        </button>
                                        <button onClick={(e) => handleDelete(e, split.id)} className="flex items-center justify-center gap-2 bg-gym-dark hover:bg-red-900/30 text-red-500 py-2.5 rounded-xl text-[10px] font-bold font-mono tracking-widest uppercase transition-colors">
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto space-y-16 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mt-4">
                <div>
                    <h1 className="text-6xl font-bebas text-white tracking-wide mb-2 drop-shadow-md">Routines & Splits</h1>
                    <p className="text-gray-400 font-medium text-lg">Choose a proven routine or build your own.</p>
                </div>
                <button onClick={() => navigate('/builder')} className="bg-gym-surface hover:bg-gym-surfaceElevated border border-[#C8FF00]/50 text-[#C8FF00] font-bebas text-2xl tracking-widest py-4 px-8 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(200,255,0,0.15)] active:scale-95">
                    <Plus size={24} /> Create Custom Split
                </button>
            </div>

            {customSplits.length > 0 && (
                <div className="space-y-8">
                    <h2 className="text-4xl font-bebas text-white border-b border-gym-border pb-4 tracking-wide shadow-sm">My Custom Splits</h2>
                    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {customSplits.map(renderSplitCard)}
                    </motion.div>
                </div>
            )}

            <div className="space-y-8">
                <h2 className="text-4xl font-bebas text-white border-b border-gym-border pb-4 tracking-wide shadow-sm">Default Templates</h2>
                <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {defaultSplits.map(renderSplitCard)}
                </motion.div>
            </div>
        </motion.div>
    );
}
