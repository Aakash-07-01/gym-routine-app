import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Progress() {
    const { token, user } = useAuthStore();
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);

    const [calcOpen, setCalcOpen] = useState(false);
    const [waist, setWaist] = useState('');
    const [neck, setNeck] = useState('');
    const [hip, setHip] = useState(''); // female only
    const [weight, setWeight] = useState(user?.startingWeight || '');

    const isFemale = user?.biologicalSex === 'Female';
    const isMetric = user?.unitPreference === 'Metric';
    const height = user?.heightCm || 180;

    useEffect(() => {
        fetchMetrics();
    }, [token]);

    const fetchMetrics = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/metrics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Reverse for chronological graph order
                setMetrics(data.reverse().map(d => ({
                    ...d,
                    dateLabel: new Date(d.dateLogged).toLocaleDateString([], { month: 'short', day: 'numeric' })
                })));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async (e) => {
        e.preventDefault();
        if (!waist || !neck || !weight || (isFemale && !hip)) {
            toast.error("Fill all measurements.");
            return;
        }

        // Standardize to cm
        const w = isMetric ? Number(waist) : Number(waist) * 2.54;
        const n = isMetric ? Number(neck) : Number(neck) * 2.54;
        const h = isMetric ? Number(hip) : Number(hip) * 2.54;
        const ht = isMetric ? height : height * 2.54;

        let bfParams = 0;
        if (isFemale) {
            bfParams = 495 / (1.29579 - 0.35004 * Math.log10(w + h - n) + 0.22100 * Math.log10(ht)) - 450;
        } else {
            bfParams = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(ht)) - 450;
        }

        const calculatedBf = Math.max(3, Math.min(bfParams, 60)).toFixed(1);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/metrics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bodyWeight: Number(weight),
                    bodyFatPercentage: Number(calculatedBf)
                })
            });
            if (res.ok) {
                toast.success(`Logged! Est. Body Fat: ${calculatedBf}%`, { icon: '📊' });
                setCalcOpen(false);
                fetchMetrics(); // reload graphs
            } else {
                toast.error("Failed to save metrics");
            }
        } catch (err) {
            toast.error("API Error");
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 max-w-5xl mx-auto pb-20">
            <header className="flex justify-between items-end mb-4 border-b-2 border-[#222] pb-6">
                <div>
                    <h1 className="text-5xl font-bebas text-white tracking-widest uppercase drop-shadow-md">Biometric Trends</h1>
                    <p className="text-gray-400 mt-2 font-mono tracking-widest text-sm uppercase">Track mass and composition over time.</p>
                </div>
                <button onClick={() => setCalcOpen(!calcOpen)} className="btn-3d-cyan px-6 py-3 rounded-xl font-bebas text-xl tracking-widest uppercase text-black">
                    {calcOpen ? 'Close Calc' : '+ Log Metrics'}
                </button>
            </header>

            <AnimatePresence>
                {calcOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="card-3d p-6 bg-[#111] mb-8 border-l-[#00E5FF]/50">
                            <h2 className="text-3xl font-bebas text-white tracking-widest mb-4">US Navy Calculator</h2>
                            <form onSubmit={handleCalculate} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Weight ({isMetric ? 'kg' : 'lbs'})</label>
                                    <input type="number" step="0.1" required className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono" value={weight} onChange={e => setWeight(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Waist ({isMetric ? 'cm' : 'in'})</label>
                                    <input type="number" step="0.1" required className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono" value={waist} onChange={e => setWaist(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Neck ({isMetric ? 'cm' : 'in'})</label>
                                    <input type="number" step="0.1" required className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono" value={neck} onChange={e => setNeck(e.target.value)} />
                                </div>
                                {isFemale && (
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Hips ({isMetric ? 'cm' : 'in'})</label>
                                        <input type="number" step="0.1" required className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono" value={hip} onChange={e => setHip(e.target.value)} />
                                    </div>
                                )}
                                <div className={isFemale ? 'col-span-4' : 'col-span-1'}>
                                    <button type="submit" className="w-full bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black font-bebas text-xl tracking-widest py-3 rounded-xl uppercase transition-colors">Save</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-t-2 border-[#00E5FF] rounded-full"></div></div>
            ) : metrics.length === 0 ? (
                <div className="text-center py-20 bg-[#111] rounded-2xl border border-[#333]">
                    <p className="text-gray-400 font-mono tracking-widest uppercase">No Biometric Data Available</p>
                    <p className="text-[#00E5FF] mt-2 font-bebas tracking-widest cursor-pointer hover:underline" onClick={() => setCalcOpen(true)}>Initialize Data</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Weight Chart */}
                    <div className="card-3d p-6 bg-[#111]">
                        <h3 className="text-2xl font-bebas text-white tracking-widest mb-6">Total Body Mass</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="dateLabel" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                                    <Area type="monotone" dataKey="bodyWeight" stroke="#FFFFFF" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Body Fat Chart */}
                    <div className="card-3d p-6 bg-[#111]">
                        <h3 className="text-2xl font-bebas text-[#00E5FF] tracking-widest mb-6 drop-shadow-md">Body Fat %</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorBf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="dateLabel" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                                    <Area type="monotone" dataKey="bodyFatPercentage" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorBf)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
