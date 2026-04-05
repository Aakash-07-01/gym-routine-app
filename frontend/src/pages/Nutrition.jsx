import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Utensils } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Nutrition() {
    const { token, user } = useAuthStore();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formOpen, setFormOpen] = useState(false);
    const [mealName, setMealName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');

    useEffect(() => {
        fetchTodayLogs();
    }, [token]);

    const fetchTodayLogs = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/nutrition/today`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setLogs(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/nutrition`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mealName,
                    calories: Number(calories),
                    proteinGrams: Number(protein || 0),
                    carbsGrams: Number(carbs || 0),
                    fatGrams: Number(fats || 0)
                })
            });
            if (res.ok) {
                toast.success("Meal Logged!", { icon: '🥑' });
                setFormOpen(false);
                setMealName(''); setCalories(''); setProtein(''); setCarbs(''); setFats('');
                fetchTodayLogs();
            }
        } catch (err) {
            toast.error("Failed to log meal");
        }
    };

    const totalCals = logs.reduce((acc, l) => acc + (l.calories || 0), 0);
    const totalPro = logs.reduce((acc, l) => acc + (l.proteinGrams || 0), 0);
    const totalCarb = logs.reduce((acc, l) => acc + (l.carbsGrams || 0), 0);
    const totalFat = logs.reduce((acc, l) => acc + (l.fatGrams || 0), 0);

    // Naive goals based on user primary goal
    let calGoal = 2500;
    if (user?.primaryGoal === 'Fat Loss') calGoal = 2000;
    if (user?.primaryGoal === 'Muscle Gain') calGoal = 3200;
    const proGoal = user?.startingWeight ? Math.round(user.startingWeight * 2) : 150;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 max-w-5xl mx-auto pb-20">
            <header className="flex justify-between items-end mb-4 border-b-2 border-[#222] pb-6">
                <div>
                    <h1 className="text-5xl font-bebas text-white tracking-widest uppercase drop-shadow-md">Macro Tracker</h1>
                    <p className="text-gray-400 mt-2 font-mono tracking-widest text-sm uppercase">Fuel your metrics.</p>
                </div>
                <button onClick={() => setFormOpen(!formOpen)} className="btn-3d-cyan px-6 py-3 rounded-xl font-bebas text-xl tracking-widest uppercase text-black flex items-center gap-2">
                    {formOpen ? 'CLOSE' : <><PlusCircle size={20} /> Log Meal</>}
                </button>
            </header>

            <AnimatePresence>
                {formOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="card-3d p-6 bg-[#111] mb-8 border-l-[#00E5FF]/50 border-t-[#00E5FF]/50">
                            <h2 className="text-3xl font-bebas text-white tracking-widest mb-6">New Entry</h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Meal Name/Description</label>
                                    <input type="text" required placeholder="e.g. Chicken & Rice" className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono" value={mealName} onChange={e => setMealName(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-xs text-[#C8FF00] font-bold uppercase tracking-widest mb-1 block">Calories</label>
                                        <input type="number" required placeholder="kcal" className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-[#C8FF00] focus:outline-none focus:border-[#00e5ff] font-bebas text-2xl tracking-widest" value={calories} onChange={e => setCalories(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[#00E5FF] font-bold uppercase tracking-widest mb-1 block">Protein (g)</label>
                                        <input type="number" placeholder="g" className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono" value={protein} onChange={e => setProtein(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-[#FF0055] font-bold uppercase tracking-widest mb-1 block">Carbs (g)</label>
                                        <input type="number" placeholder="g" className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono" value={carbs} onChange={e => setCarbs(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-1 block">Fats (g)</label>
                                        <input type="number" placeholder="g" className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00e5ff] font-mono" value={fats} onChange={e => setFats(e.target.value)} />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full btn-3d-lime text-black font-bebas text-2xl tracking-widest py-3 rounded-xl uppercase transition-transform">ADD TO DAILY LOG</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Daily Totals */}
            <h2 className="text-3xl font-bebas text-white tracking-widest uppercase mb-4">Daily Totals</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <div className="card-3d p-6 bg-[#111] border-l-[#C8FF00] relative overflow-hidden">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Calories</p>
                    <p className="text-5xl font-bebas text-white">{totalCals}</p>
                    <div className="w-full bg-[#333] h-1.5 mt-4 rounded-full overflow-hidden">
                        <div className="bg-[#C8FF00] h-full transition-all" style={{ width: `${Math.min((totalCals / calGoal) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono mt-2 text-right">Goal: {calGoal}</p>
                </div>

                <div className="card-3d p-6 bg-[#111] border-l-[#00E5FF]">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Protein</p>
                    <p className="text-5xl font-bebas text-[#00E5FF]">{totalPro}<span className="text-xl">g</span></p>
                    <div className="w-full bg-[#333] h-1.5 mt-4 rounded-full overflow-hidden">
                        <div className="bg-[#00E5FF] h-full transition-all" style={{ width: `${Math.min((totalPro / proGoal) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono mt-2 text-right">Goal: {proGoal}g</p>
                </div>

                <div className="card-3d p-6 bg-[#111] border-l-[#FF0055]">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Carbs</p>
                    <p className="text-5xl font-bebas text-white">{totalCarb}<span className="text-xl">g</span></p>
                </div>

                <div className="card-3d p-6 bg-[#111] border-l-orange-500">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Fats</p>
                    <p className="text-5xl font-bebas text-white">{totalFat}<span className="text-xl">g</span></p>
                </div>
            </div>

            {/* Logs List */}
            <h2 className="text-3xl font-bebas text-white tracking-widest uppercase mb-4 border-b-2 border-[#222] pb-2">Today's Meals</h2>
            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin h-6 w-6 border-t-2 border-[#00E5FF] rounded-full"></div></div>
            ) : logs.length === 0 ? (
                <div className="text-center py-16 bg-[#111] rounded-2xl border border-[#333] flex flex-col items-center">
                    <Utensils size={40} className="text-gray-600 mb-4" />
                    <p className="text-gray-400 font-mono tracking-widest uppercase">No meals logged today</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {logs.map(log => (
                        <div key={log.id} className="card-3d-item bg-[#1a1a1a] p-5 border-[#333] flex justify-between items-center rounded-xl hover:border-[#00E5FF]/50 transition-colors">
                            <div>
                                <h3 className="text-xl font-bebas uppercase text-white tracking-widest">{log.mealName}</h3>
                                <p className="text-xs font-mono text-gray-500 mt-1">{new Date(log.dateLogged).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PRO</p>
                                    <p className="text-sm font-mono text-[#00E5FF]">{log.proteinGrams || 0}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">KCAL</p>
                                    <p className="text-xl font-bebas text-[#C8FF00] tracking-widest">{log.calories || 0}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
