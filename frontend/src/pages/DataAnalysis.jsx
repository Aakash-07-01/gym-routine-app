import { useState, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Download, BarChart2, Loader2, Database, Activity, Dumbbell } from 'lucide-react';
import VolumeTrendChart from '../components/analysis/VolumeTrendChart';
import WorkoutDistributionChart from '../components/analysis/WorkoutDistributionChart';
import { BodyMap } from '../components/bodyMap/BodyMap';
import { getVolumeThresholds, getMuscleParams } from '../utils/muscle/hypertrophy/muscleParams';
import { MUSCLE_NAMES } from '../utils/muscle/mapping/muscleHeadless';
import { STRENGTH_STANDARDS, calculate1RM, getStrengthLevel, STRENGTH_LEVEL_COLORS } from '../utils/muscle/strengthStandards';

const EXERCISE_TO_MUSCLE_ID = {
  "Barbell Bench Press": ["mid-lower-pectoralis", "anterior-deltoid", "lateral-head-triceps"],
  "Overhead Press": ["anterior-deltoid", "lateral-deltoid", "long-head-triceps"],
  "Incline Dumbbell Press": ["upper-pectoralis", "anterior-deltoid", "medial-head-triceps"],
  "Tricep Pushdowns": ["long-head-triceps", "lateral-head-triceps", "medial-head-triceps"],
  "Deadlift": ["gluteus-maximus", "lowerback", "medial-hamstrings", "lateral-hamstrings"],
  "Barbell Rows": ["lats", "traps-middle", "lower-trapezius", "long-head-bicep"],
  "Pull-Ups": ["lats", "short-head-bicep", "long-head-bicep"],
  "Barbell Curls": ["long-head-bicep", "short-head-bicep"],
  "Barbell Squat": ["gluteus-maximus", "outer-quadricep", "rectus-femoris", "inner-quadricep"],
  "Leg Press": ["outer-quadricep", "rectus-femoris", "inner-quadricep"],
  "Leg Curls": ["medial-hamstrings", "lateral-hamstrings"],
  "Calf Raises": ["gastrocnemius", "soleus"],
  "Cable Crunches": ["abdominals", "obliques"]
};

export default function DataAnalysis() {
    const { token } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hoveredMuscle, setHoveredMuscle] = useState(null);
    const [muscleVolumes, setMuscleVolumes] = useState(new Map());
    const [maxVolume, setMaxVolume] = useState(1);
    
    const [heatmapMode, setHeatmapMode] = useState('volume');
    const [muscleColors, setMuscleColors] = useState(new Map());
    const [muscleStrengthInfo, setMuscleStrengthInfo] = useState(new Map());

    const handlePartHover = useCallback((id) => {
        setHoveredMuscle(id);
    }, []);

    const handlePartClick = useCallback((id) => {}, []);
    const volumeThresholds = useMemo(() => getVolumeThresholds('intermediate'), []);

    const handleAnalyzeData = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            
            const [csvResponse, prsResponse, profileResponse] = await Promise.all([
                fetch(`${apiUrl}/api/export/csv`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiUrl}/api/prs`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiUrl}/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            if (!csvResponse.ok) throw new Error('Failed to fetch data');
            
            const csvText = await csvResponse.text();
            const prsData = prsResponse.ok ? await prsResponse.json() : [];
            const profileData = profileResponse.ok ? await profileResponse.json() : {};
            
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const validData = results.data.filter(r => r['Exercise Name'] && r['Date']);
                    setData(validData);
                    
                    const volumes = new Map();
                    let maxV = 1;
                    validData.forEach(row => {
                        const exerciseName = row['Exercise Name'];
                        if (exerciseName && EXERCISE_TO_MUSCLE_ID[exerciseName]) {
                            EXERCISE_TO_MUSCLE_ID[exerciseName].forEach(muscle => {
                                const newVol = (volumes.get(muscle) || 0) + 1;
                                volumes.set(muscle, newVol);
                                if (newVol > maxV) maxV = newVol;
                            });
                        }
                    });
                    setMuscleVolumes(volumes);
                    setMaxVolume(maxV);

                    const colors = new Map();
                    const info = new Map();
                    const bodyweight = profileData.currentWeight || 80;
                    const gender = profileData.biologicalSex || 'male';

                    STRENGTH_STANDARDS.forEach(standard => {
                        const pr = prsData.find(p => p.exerciseName.toLowerCase() === standard.exerciseName.toLowerCase());
                        if (pr) {
                            let weightToUse = pr.maxWeight;
                            if (standard.isBodyweightIncluded) {
                                weightToUse += bodyweight;
                            }
                            const oneRepMax = calculate1RM(weightToUse, pr.maxRepsAtWeight || 1);
                            const level = getStrengthLevel(oneRepMax, bodyweight, gender, standard);
                            const hexColor = STRENGTH_LEVEL_COLORS[level];

                            standard.muscleIds.forEach(muscleId => {
                                colors.set(muscleId, hexColor);
                                info.set(muscleId, {
                                    level,
                                    oneRepMax: Math.round(oneRepMax),
                                    exerciseName: standard.exerciseName,
                                    unit: pr.weightUnit || (profileData.unitPreference === 'IMPERIAL' ? 'lbs' : 'kg')
                                });
                            });
                        }
                    });
                    setMuscleColors(colors);
                    setMuscleStrengthInfo(info);

                    setLoading(false);
                    toast.success('Data analyzed successfully!', {
                        style: { borderRadius: '10px', background: '#333', color: '#fff' }
                    });
                },
                error: (error) => {
                    setError(error.message);
                    setLoading(false);
                    toast.error('Failed to parse CSV data');
                }
            });
        } catch (err) {
            setError(err.message);
            setLoading(false);
            toast.error('Failed to fetch and analyze data');
        }
    };

    const handleDownloadCSV = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/export/csv`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gym_data_export.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            toast.error('Failed to download CSV');
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8 pb-12">
            <header className="glass-panel p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-end justify-between bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-hidden relative gap-6">
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0B0B0B]/70 to-transparent"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-gym-blue/20 rounded-xl border border-gym-blue/30 text-gym-blue">
                            <BarChart2 size={32} />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">Data Analysis</h1>
                    </div>
                    <p className="text-gray-400 font-mono tracking-wider text-sm max-w-xl">
                        LiftShift-powered insights based on your raw workout data. Export to CSV or analyze directly in your browser.
                    </p>
                </div>
                
                <div className="relative z-10 flex gap-4 w-full md:w-auto">
                    <button 
                        onClick={handleAnalyzeData}
                        disabled={loading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 glass-button bg-gym-blue/20 hover:bg-gym-blue/30 border-gym-blue/50 text-white font-bold px-6 py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(0,122,255,0.2)] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
                        <span>Analyze My Data</span>
                    </button>
                    <button 
                        onClick={handleDownloadCSV}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 glass-button px-6 py-4 rounded-xl font-bold transition-all text-gray-300 hover:text-white"
                        title="Download CSV"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </header>

            {error && (
                <div className="bg-gym-red/10 border border-gym-red/30 text-gym-red p-4 rounded-xl font-mono text-sm">
                    Error: {error}
                </div>
            )}

            {!data && !loading && !error && (
                <div className="glass-panel p-16 text-center flex flex-col items-center justify-center border-2 border-dashed border-white/10">
                    <Database size={48} className="text-gray-500 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No Data Loaded</h3>
                    <p className="text-gray-500 font-mono text-sm">Click "Analyze My Data" to generate insights from your workout history.</p>
                </div>
            )}

            {data && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="glass-panel p-6 sm:p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gym-blue/10 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-150 duration-700"></div>
                        <h3 className="text-2xl font-bebas tracking-widest text-white mb-6 relative z-10 flex items-center gap-3">
                            <span className="w-8 h-1 bg-gym-blue rounded-full"></span>
                            Muscle Activation Heatmap
                        </h3>
                        
                        <div className="flex justify-center mb-8 relative z-10">
                            <div className="bg-black/50 p-1 rounded-xl flex border border-white/10 backdrop-blur-md">
                                <button
                                    onClick={() => setHeatmapMode('volume')}
                                    className={`px-6 py-2 rounded-lg font-mono text-sm tracking-wider flex items-center gap-2 transition-all ${
                                        heatmapMode === 'volume' 
                                        ? 'bg-gym-blue text-white shadow-[0_0_15px_rgba(0,122,255,0.4)]' 
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Activity size={16} />
                                    VOLUME (SETS)
                                </button>
                                <button
                                    onClick={() => setHeatmapMode('strength')}
                                    className={`px-6 py-2 rounded-lg font-mono text-sm tracking-wider flex items-center gap-2 transition-all ${
                                        heatmapMode === 'strength' 
                                        ? 'bg-gym-accent text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]' 
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Dumbbell size={16} />
                                    STRENGTH (PR RANK)
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center relative z-10">
                            <div className="w-full lg:w-1/2 flex justify-center transform hover:scale-[1.02] transition-transform duration-500">
                                <BodyMap 
                                    onPartClick={handlePartClick}
                                    selectedPart={null}
                                    muscleVolumes={muscleVolumes}
                                    maxVolume={maxVolume}
                                    volumeThresholds={volumeThresholds}
                                    muscleColors={heatmapMode === 'strength' ? muscleColors : undefined}
                                    onPartHover={handlePartHover}
                                    gender="male"
                                    variant="original"
                                />
                            </div>
                            <div className="w-full lg:w-1/3 bg-black/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm h-[300px] flex flex-col justify-center">
                                {hoveredMuscle ? (
                                    <motion.div initial={{opacity: 0, x: -10}} animate={{opacity: 1, x: 0}} className="text-center">
                                        <p className="text-gym-blue text-sm font-mono uppercase tracking-widest mb-2">Targeted Muscle</p>
                                        <h4 className="text-3xl font-bold text-white mb-4 capitalize">
                                            {MUSCLE_NAMES?.[hoveredMuscle] || getMuscleParams(hoveredMuscle)?.name || hoveredMuscle.replace(/-/g, ' ')}
                                        </h4>
                                        {heatmapMode === 'volume' ? (
                                            <div className="inline-flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl p-4 min-w-[140px]">
                                                <span className="text-4xl font-black text-gym-accent mb-1">{muscleVolumes.get(hoveredMuscle) || 0}</span>
                                                <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Total Sets</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl p-4 min-w-[180px]">
                                                {muscleStrengthInfo.has(hoveredMuscle) ? (
                                                    <>
                                                        <span className="text-2xl font-black text-white capitalize mb-1" style={{ color: STRENGTH_LEVEL_COLORS[muscleStrengthInfo.get(hoveredMuscle).level] }}>
                                                            {muscleStrengthInfo.get(hoveredMuscle).level}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-mono tracking-wider mb-2">
                                                            {muscleStrengthInfo.get(hoveredMuscle).exerciseName}
                                                        </span>
                                                        <div className="flex flex-col items-center w-full mt-2 pt-2 border-t border-white/10">
                                                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Max Lift (1 Rep)</span>
                                                            <div className="text-xl font-bold text-white">
                                                                <span className="text-gym-accent">{muscleStrengthInfo.get(hoveredMuscle).oneRepMax}</span>
                                                                <span className="text-sm text-gray-500 ml-1">{muscleStrengthInfo.get(hoveredMuscle).unit || 'kg'}</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-2xl font-black text-gray-500 mb-1">Unranked</span>
                                                        <span className="text-xs text-gray-500 font-mono uppercase tracking-wider text-center">No PR recorded<br/>for this muscle</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <div className="text-center text-gray-500 opacity-60">
                                        <p className="text-5xl mb-4">🧍‍♂️</p>
                                        <p className="font-mono text-sm uppercase tracking-widest">Hover over the diagram<br/>to see muscle stats</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <VolumeTrendChart data={data} />
                        <WorkoutDistributionChart data={data} />
                    </div>
                    
                    <div className="glass-panel p-6">
                        <h3 className="text-xl font-bold text-white mb-6">Raw Data Summary</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-gray-500 font-mono text-xs uppercase tracking-widest">
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Workout</th>
                                        <th className="p-3">Exercise</th>
                                        <th className="p-3">Weight</th>
                                        <th className="p-3">Reps</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                                            <td className="p-3 text-gray-400 font-mono">{row['Date']}</td>
                                            <td className="p-3 text-white font-medium">{row['Workout Name']}</td>
                                            <td className="p-3 text-gray-300">{row['Exercise Name']}</td>
                                            <td className="p-3 text-gym-blue font-mono font-bold">{row['Weight']} {row['Weight Unit']}</td>
                                            <td className="p-3 text-gym-accent font-mono">{row['Reps']}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {data.length > 10 && (
                                <div className="p-4 text-center text-gray-500 font-mono text-xs tracking-widest uppercase">
                                    Showing 10 of {data.length} records. Download CSV for full data.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
