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

    const renderSplitCard = (split) => (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            key={split.id}
            className="bg-gym-surfaceElevated border border-gym-border p-6 rounded-2xl shadow-xl transition-all flex flex-col justify-between hover:border-gym-primary group"
        >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bebas tracking-wide text-white group-hover:text-gym-primary transition-colors">{split.name}</h3>
                    <span className="bg-gym-surface text-gym-primary px-3 py-1 rounded-full text-xs font-bold font-mono border border-gym-border">
                        {split.days.length} DAYS
                    </span>
                </div>
                <p className="text-gray-400 text-sm mb-6">{split.isDefault ? 'Expert preset schedule.' : 'Custom personalized routine.'}</p>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
                <button
                    onClick={() => handleUseSplit(split.id)}
                    disabled={loadingId === split.id}
                    className="w-full bg-gym-primary hover:bg-[#bce600] active:scale-95 disabled:opacity-50 text-black font-bold uppercase py-3 rounded-xl transition-all"
                >
                    {loadingId === split.id ? 'Loading...' : 'Use This Routine'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                    {split.isDefault ? (
                        <button onClick={() => navigate(`/builder/${split.id}`)} className="col-span-2 flex items-center justify-center gap-2 bg-gym-surface hover:bg-gym-border text-white py-2 rounded-xl text-sm font-bold uppercase transition-colors">
                            <Copy size={16} /> Duplicate to Custom
                        </button>
                    ) : (
                        <>
                            <button onClick={() => navigate(`/builder/${split.id}`)} className="flex items-center justify-center gap-2 bg-gym-surface hover:bg-gym-border text-white py-2 rounded-xl text-sm font-bold uppercase transition-colors">
                                <Edit2 size={16} /> Edit
                            </button>
                            <button onClick={(e) => handleDelete(e, split.id)} className="flex items-center justify-center gap-2 bg-gym-surface hover:bg-red-900/30 text-gym-accent hover:text-red-400 py-2 rounded-xl text-sm font-bold uppercase transition-colors">
                                <Trash2 size={16} /> Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto space-y-12 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bebas text-white tracking-wide mb-1">Routines & Splits</h1>
                    <p className="text-gray-400">Choose a proven routine or build your own.</p>
                </div>
                <button onClick={() => navigate('/builder')} className="bg-gym-surface hover:bg-gym-border border border-gym-border text-gym-primary font-bold uppercase py-3 px-6 rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                    <Plus size={20} /> Create Custom Split
                </button>
            </div>

            {customSplits.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-3xl font-bebas text-white border-b border-gym-border pb-2 tracking-wide">My Custom Splits</h2>
                    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customSplits.map(renderSplitCard)}
                    </motion.div>
                </div>
            )}

            <div className="space-y-6">
                <h2 className="text-3xl font-bebas text-white border-b border-gym-border pb-2 tracking-wide">Default Templates</h2>
                <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {defaultSplits.map(renderSplitCard)}
                </motion.div>
            </div>
        </motion.div>
    );
}
