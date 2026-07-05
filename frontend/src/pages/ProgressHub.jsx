import { BodyMap } from '../components/bodyMap/BodyMap';
import { AnimatePresence, motion } from 'framer-motion';
import { getMuscleParams, getVolumeThresholds } from '../utils/muscle/hypertrophy/muscleParams';
import Papa from 'papaparse';
import { Activity, BarChart2, CalendarDays, Camera, ChevronLeft, ChevronRight, Database, Download, Dumbbell, Loader2, Scale, X } from 'lucide-react';
import WorkoutDistributionChart from '../components/analysis/WorkoutDistributionChart';
import { STRENGTH_LEVEL_COLORS, STRENGTH_STANDARDS, calculate1RM, getStrengthLevel } from '../utils/muscle/strengthStandards';
import VolumeTrendChart from '../components/analysis/VolumeTrendChart';
import useGymStore from '../store/gymStore';
import { MUSCLE_NAMES } from '../utils/muscle/mapping/muscleHeadless';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { useLocation } from 'react-router-dom';
import Progress from './Progress';

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

function CalendarTab() {

    const { workoutLog, activeSplitId, splits, logWorkout } = useGymStore();
    const [currentMonth, setCurrentMonth] = useState(() => {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [selectedDateObj, setSelectedDateObj] = useState(null);

    const currentUser = useAuthStore(state => state.user);
    const validSplits = splits.filter(s => s.isDefault || !s._username || s._username === currentUser?.username);
    const filteredWorkoutLog = workoutLog.filter(l => !l._username || l._username === currentUser?.username);

    const activeSplit = validSplits.find(s => s.id === activeSplitId);

    const prevMonth = () => {
        const d = new Date(currentMonth);
        d.setMonth(d.getMonth() - 1);
        setCurrentMonth(d);
    };

    const nextMonth = () => {
        const d = new Date(currentMonth);
        d.setMonth(d.getMonth() + 1);
        setCurrentMonth(d);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const calendarGrid = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        let startDayIndex = firstDay.getDay() - 1;
        if (startDayIndex === -1) startDayIndex = 6; // Sunday becomes 6

        // Previous month padding
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = startDayIndex - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, prevMonthDays - i);
            days.push({ date: d, isCurrentMonth: false });
        }

        // Current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const d = new Date(year, month, i);
            days.push({ date: d, isCurrentMonth: true });
        }

        // Next month padding
        const remaining = 42 - days.length; // Ensure 6 rows (42 days)
        for (let i = 1; i <= remaining; i++) {
            const d = new Date(year, month + 1, i);
            days.push({ date: d, isCurrentMonth: false });
        }

        return days;
    }, [currentMonth]);

    const getDayStatus = (d) => {
        const dateStr = d.toISOString().split('T')[0];
        const todayStr = new Date().toISOString().split('T')[0];
        const isToday = dateStr === todayStr;
        const isFuture = d > new Date(new Date().setHours(23, 59, 59, 999));

        const logs = filteredWorkoutLog.filter(l => l.date === dateStr);
        const isCompleted = logs.length > 0;
        const log = logs[0];

        let scheduledDayId = null;
        if (activeSplit && activeSplit.schedule) {
            scheduledDayId = activeSplit.schedule[d.getDay()];
        }

        // Status determination logic
        if (isToday) {
            if (isCompleted) return 'today-completed';
            return 'today-pending';
        }

        if (!isFuture) {
            if (isCompleted) return 'past-completed';
            if (scheduledDayId === 'rest') return 'past-rest';
            if (scheduledDayId && scheduledDayId !== 'rest' && !isCompleted) return 'past-missed';
            return 'none';
        }

        if (isFuture) {
            if (scheduledDayId === 'rest') return 'future-rest';
            if (scheduledDayId && scheduledDayId !== 'rest') return 'future-scheduled';
            return 'none';
        }

        return 'none';
    };

    const getDotClass = (status) => {
        switch (status) {
            case 'today-completed': return 'bg-gym-success shadow-[0_0_10px_rgba(0,230,118,0.8)]';
            case 'today-pending': return 'bg-yellow-400 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.6)]';
            case 'past-completed': return 'bg-gym-success';
            case 'past-partial': return 'bg-yellow-400';
            case 'past-missed': return 'bg-gym-red';
            case 'past-rest': return 'bg-blue-500';
            case 'future-scheduled': return 'border border-white/30 bg-transparent';
            default: return 'hidden';
        }
    };

    const handleDayTap = (dayObj) => {
        setSelectedDateObj(dayObj);
    };

    const markAsRest = () => {
        if (!selectedDateObj) return;
        const dateStr = selectedDateObj.date.toISOString().split('T')[0];
        // add mock rest to log to turn it blue instead of missed
        useGymStore.setState(state => {
            const user = useAuthStore.getState().user;
            return {
                workoutLog: [...state.workoutLog, { date: dateStr, splitId: activeSplit?.id, dayId: 'rest', _username: user?.username, completedAt: new Date().toISOString() }]
            };
        });
        setSelectedDateObj(null);
    };

    const renderSheetContent = () => {
        if (!selectedDateObj) return null;
        const d = selectedDateObj.date;
        const status = getDayStatus(d);
        const scheduledDayId = activeSplit?.schedule?.[d.getDay()];
        const scheduledDay = activeSplit?.days?.find(day => day.id === scheduledDayId);
        const dateStr = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
        const log = filteredWorkoutLog.find(l => l.date === d.toISOString().split('T')[0]);

        if (status === 'past-completed' || status === 'today-completed') {
            const completedDayName = activeSplit?.days?.find(day => day.id === log?.dayId)?.name || 'Workout';
            return (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bebas text-white tracking-wide">{activeSplit?.name} — {completedDayName}</h2>
                        <p className="text-gray-400">{dateStr}</p>
                    </div>

                    <div className="bg-gym-surface p-4 rounded-xl border border-gym-border">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Duration</p>
                        <p className="text-2xl font-mono text-gym-primary">1h 12m</p>
                    </div>

                    <div className="bg-gym-surface rounded-xl border border-gym-border p-4">
                        <h3 className="text-lg font-bebas text-white mb-2">Exercises Completed</h3>
                        <div className="space-y-2">
                            {/* Mocking exercises since log doesn't store full exercise states currently */}
                            <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                <span className="text-gray-300">Bench Press</span>
                                <span className="font-mono text-sm text-gym-primary">4x8 @ 100kg</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                                <span className="text-gray-300">Incline DB Press</span>
                                <span className="font-mono text-sm text-gym-primary">3x10 @ 40kg</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gym-surface/50 border border-gym-border rounded-xl">
                        <p className="text-sm text-gray-400"><span className="text-gym-success font-bold">Notes:</span> Felt great today, PR on the bench! 💪</p>
                    </div>
                </div>
            );
        }

        if (status === 'past-rest' || status === 'today-rest' || status === 'future-rest') {
            return (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bebas text-blue-400 tracking-wide">Rest Day 💤</h2>
                        <p className="text-gray-400">{dateStr}</p>
                    </div>
                    <div className="bg-gym-surface p-6 rounded-xl border border-blue-900/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <h3 className="text-lg font-bold text-white mb-2">Recovery Tip</h3>
                        <p className="text-gray-400">Sleep 8+ hours tonight for maximum muscle protein synthesis. Drink plenty of water and stay active with light walking.</p>
                    </div>
                    {/* Body Metrics section */}
                    <div className="flex space-x-4">
                        <div className="flex-1 bg-gym-surface p-4 rounded-xl border border-gym-border flex items-center space-x-3">
                            <Scale className="text-gym-primary" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Bodyweight</p>
                                <p className="text-lg text-white font-mono">82.5 kg</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (status === 'past-missed') {
            return (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bebas text-gym-red tracking-wide">Missed Workout 😔</h2>
                        <p className="text-gray-400">{dateStr}</p>
                    </div>
                    <div className="bg-gym-surface p-6 rounded-xl border border-red-900/30">
                        <p className="text-gray-300 mb-4">You were scheduled for <strong className="text-white">{scheduledDay?.name}</strong> but didn't log a workout.</p>
                        <button
                            onClick={markAsRest}
                            className="w-full py-3 bg-gym-gray border border-gym-border hover:border-blue-500 hover:text-blue-400 rounded-xl transition-all font-bold text-gray-400"
                        >
                            Mark as intentional Rest Day
                        </button>
                    </div>
                </div>
            );
        }

        if (status === 'future-scheduled' || status === 'today-pending') {
            return (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bebas text-white tracking-wide">{status === 'today-pending' ? "Today's Session" : "Upcoming Session"}</h2>
                        <p className="text-gym-primary text-lg font-bold uppercase tracking-wider">{scheduledDay?.name}</p>
                        <p className="text-gray-400 text-sm mt-1">{dateStr}</p>
                    </div>
                    <div className="bg-gym-surface p-4 rounded-xl border border-gym-border">
                        <h3 className="text-sm text-gray-400 uppercase tracking-widest mb-3">Exercise Preview</h3>
                        <div className="space-y-2">
                            {scheduledDay?.exercises?.map(ex => (
                                <div key={ex.id} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-200">{ex.name}</span>
                                    <span className="text-gray-500 font-mono">{ex.sets} × {ex.reps}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-gym-surface p-4 rounded-xl border border-gym-border">
                        <span className="text-gray-300">Set as Rest Day?</span>
                        <button onClick={markAsRest} className="w-12 h-6 bg-gym-gray rounded-full relative border border-gym-border">
                            <div className="w-4 h-4 bg-gray-500 rounded-full absolute left-1 top-0.5"></div>
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 text-center text-gray-400">
                <p>No data for this date.</p>
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-8 pb-20 relative">
            <div>
                <h1 className="text-5xl font-bebas text-white tracking-wide mb-1 drop-shadow-lg">Calendar</h1>
                <p className="text-gray-400">Track your consistency and view past performance.</p>
            </div>

            {/* Custom Calendar Card */}
            <div className="bg-gym-surfaceElevated backdrop-blur-md bg-opacity-80 border border-gym-border p-6 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] transform perspective-[1000px] hover:rotate-x-1 hover:rotate-y-1 transition-transform duration-500">
                {/* Month Navigation */}
                <div className="flex justify-between items-center mb-8">
                    <button onClick={prevMonth} className="p-2 hover:bg-gym-surface rounded-full transition-colors text-gym-primary">
                        <ChevronLeft size={28} />
                    </button>
                    <h2 className="text-3xl font-bebas text-white tracking-widest">{monthNames[currentMonth.getMonth()]} <span className="text-gym-primary">{currentMonth.getFullYear()}</span></h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-gym-surface rounded-full transition-colors text-gym-primary">
                        <ChevronRight size={28} />
                    </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-xs text-gray-500 uppercase tracking-widest font-bold">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarGrid.map((dayObj, i) => {
                        const status = getDayStatus(dayObj.date);
                        const isToday = dayObj.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

                        // Fake body metrics for demonstration (show icons randomly if completed)
                        const showWeight = status.includes('completed') && (i % 5 === 0);
                        const showPhoto = status.includes('completed') && (i % 8 === 0);

                        return (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                key={i}
                                onClick={() => handleDayTap(dayObj)}
                                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative border transition-all ${dayObj.isCurrentMonth ? 'bg-gym-surface/40 hover:bg-gym-surface/80 border-gym-border/50' : 'bg-transparent border-transparent opacity-30 select-none'
                                    } ${isToday ? 'border-gym-primary/50 bg-gym-primary/5' : ''}`}
                            >
                                <span className={`text-sm font-mono ${isToday ? 'text-gym-primary font-bold' : 'text-gray-300'}`}>
                                    {dayObj.date.getDate()}
                                </span>

                                {/* Status Dot */}
                                <div className={`w-2 h-2 rounded-full mt-1 ${getDotClass(status)}`} />

                                {/* Metric Icons Wrapper */}
                                {(showWeight || showPhoto) && dayObj.isCurrentMonth && (
                                    <div className="absolute bottom-1 flex gap-1 text-gray-500">
                                        {showWeight && <Scale size={10} />}
                                        {showPhoto && <Camera size={10} />}
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Sheet Drawer */}
            <AnimatePresence>
                {selectedDateObj && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDateObj(null)}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-gym-dark border-t border-gym-border rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="sticky top-0 bg-gym-dark/90 backdrop-blur-md pt-4 pb-2 px-6 flex justify-between items-center border-b border-gym-border/50 z-10">
                                <div className="w-12 h-1.5 bg-gym-gray rounded-full mx-auto mb-2 opacity-50 absolute left-1/2 -translate-x-1/2 top-2"></div>
                                <div></div>
                                <button onClick={() => setSelectedDateObj(null)} className="p-2 bg-gym-surface rounded-full hover:bg-gym-gray transition-colors text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 md:p-8 pt-4">
                                {renderSheetContent()}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function AnalyticsTab() {

    const { token, user } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hoveredMuscle, setHoveredMuscle] = useState(null);
    const [muscleVolumes, setMuscleVolumes] = useState(new Map());
    const [maxVolume, setMaxVolume] = useState(1);
    

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
                        


                        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center relative z-10">
                            <div className="w-full lg:w-1/2 flex justify-center transform hover:scale-[1.02] transition-transform duration-500">
                                <BodyMap 
                                    onPartClick={handlePartClick}
                                    selectedPart={null}
                                    muscleVolumes={muscleVolumes}
                                    maxVolume={maxVolume}
                                    volumeThresholds={volumeThresholds}
                                    muscleColors={muscleColors}
                                    onPartHover={handlePartHover}
                                    gender={user?.biologicalSex === 'Female' ? 'female' : 'male'}
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

const TABS = [
  { id: 'calendar',  label: 'Calendar',  icon: CalendarDays },
  { id: 'metrics',   label: 'Biometrics', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

export default function ProgressHub() {
  const location = useLocation();
  const [active, setActive] = useState('calendar');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && TABS.some(t => t.id === tab)) {
      setActive(tab);
    }
  }, [location.search]);
  return (
    <div className="pb-12">
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide transition-all border-b-2 -mb-px ${
              active === id
                ? 'border-gym-blue text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      {active === 'calendar'  && <CalendarTab />}
      {active === 'metrics'   && <Progress />}
      {active === 'analytics' && <AnalyticsTab />}
    </div>
  );
}
