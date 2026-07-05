import { Link, useNavigate } from 'react-router-dom';
import YoutubeModal from '../components/YoutubeModal';
import { defaultSplits } from '../data/defaultSplits';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, ChevronDown, ChevronUp, Circle, Copy, Edit2, GripVertical, LayoutList, PlayCircle, Plus, Trash2, Trophy, X } from 'lucide-react';
import RestDay from '../components/RestDay';
import { AnimatePresence, motion } from 'framer-motion';
import Confetti from 'react-confetti';
import CardioPromptModal from '../components/CardioPromptModal';
import useAuthStore from '../store/authStore';
import useGymStore from '../store/gymStore';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';


function SortableExercise({ exercise, onToggleSet, onUpdateSet, onOpenVideo, isLocked, suggestion }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exercise.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const [expanded, setExpanded] = useState(false);

    // Calculate if entirely finished
    const setsFinishedCount = exercise.setLogs?.filter(s => s.completed).length || 0;
    const isChecked = isLocked || (exercise.setLogs && setsFinishedCount === exercise.setLogs.length && exercise.setLogs.length > 0);

    return (
        <div ref={setNodeRef} style={style} className={`glass-panel flex flex-col transition-all duration-300 ${isChecked ? 'border-gym-blue/40 bg-gym-blue/5' : 'glass-panel-hover'} ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}>

            {/* Header Row */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 relative z-10 bg-gym-surface">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div {...attributes} {...listeners} className={`cursor-grab shrink-0 ${isLocked ? 'pointer-events-none opacity-0' : 'text-gray-500 hover:text-white'}`}>
                        <GripVertical size={20} />
                    </div>

                    <div className="flex-1 sm:hidden">
                        <h4 className={`text-base font-bold tracking-wide transition-all ${isChecked ? 'line-through text-gray-500' : 'text-white'}`}>
                            {exercise.name}
                        </h4>
                    </div>
                    <button onClick={onOpenVideo} className="text-gym-red hover:text-white p-2 sm:hidden shrink-0 ml-auto" title="Watch Tutorial">
                        <PlayCircle size={28} />
                    </button>
                    <button onClick={() => setExpanded(!expanded)} className="text-gym-blue p-2 sm:hidden shrink-0">
                        {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                </div>

                <div className="flex-1 hidden sm:block ml-2 w-full">
                    {suggestion && !isChecked && (
                        <div className="text-[10px] text-gym-red font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                            🚀 {suggestion}
                        </div>
                    )}
                    <h4 className={`text-xl font-bold tracking-wide transition-all ${isChecked ? 'text-gym-blue drop-shadow-sm' : 'text-white drop-shadow-sm'} truncate`}>
                        {exercise.name}
                    </h4>
                    <p className="text-sm font-mono text-gray-400 mt-1 tracking-widest">
                        {setsFinishedCount} / {exercise.setLogs?.length || exercise.sets} SETS COMPLETED
                    </p>
                </div>

                <div className="sm:hidden pl-12 mt-1 flex justify-between items-center">
                    <p className="text-xs font-mono text-gray-400 tracking-widest">
                        {setsFinishedCount} / {exercise.setLogs?.length || exercise.sets} SETS
                    </p>
                </div>

                <div className="hidden sm:flex items-center gap-3 shrink-0 ml-auto">
                    <button onClick={onOpenVideo} className="text-gym-red hover:text-white hover:scale-110 transition-transform p-2 drop-shadow-[0_0_8px_rgba(255,59,48,0.3)]" title="Watch Tutorial">
                        <PlayCircle size={32} />
                    </button>
                    <button onClick={() => setExpanded(!expanded)} className="text-gym-blue hover:text-white transition-colors p-2 bg-white/5 rounded-lg border border-white/10">
                        {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                </div>
            </div>

            {/* Expanded Sets Tracker Accordion */}
            <AnimatePresence>
                {(expanded || !isChecked) && exercise.setLogs && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5">
                        <div className="p-4 sm:px-6 sm:py-5 space-y-3 bg-black/20">
                            {/* Headers */}
                            <div className="flex items-center gap-3 text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-widest font-bold px-2 mb-1">
                                <div className="w-8 text-center">Set</div>
                                <div className="flex-1 text-center shrink">Weight</div>
                                <div className="flex-1 text-center shrink">Reps</div>
                                <div className="w-10 text-center">Done</div>
                            </div>

                            {/* Rows */}
                            {exercise.setLogs.map((setLog, index) => (
                                <div key={index} className={`flex items-center gap-3 p-2 rounded-xl transition-all ${setLog.completed ? 'bg-gym-blue/10 border border-gym-blue/20' : 'bg-white/5 border border-transparent'} ${isLocked ? 'pointer-events-none' : ''}`}>
                                    <div className="w-8 text-center font-mono text-gray-400 font-bold text-sm">{index + 1}</div>

                                    <div className="flex-1 flex justify-center">
                                        <div className="relative w-full max-w-[100px]">
                                            <input
                                                type="number"
                                                value={setLog.weight}
                                                onChange={(e) => onUpdateSet(exercise.id, index, 'weight', e.target.value)}
                                                className={`w-full bg-black/40 border border-white/10 rounded-lg py-2 sm:py-2.5 px-3 text-center text-white font-mono text-sm sm:text-base outline-none focus:border-gym-primary transition-all ${setLog.completed ? 'opacity-50' : ''}`}
                                                placeholder={exercise.weight || '0'}
                                                disabled={setLog.completed || isLocked}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 flex justify-center">
                                        <div className="relative w-full max-w-[100px]">
                                            <input
                                                type="number"
                                                value={setLog.reps}
                                                onChange={(e) => onUpdateSet(exercise.id, index, 'reps', e.target.value)}
                                                className={`w-full bg-black/40 border border-white/10 rounded-lg py-2 sm:py-2.5 px-3 text-center text-white font-mono text-sm sm:text-base outline-none focus:border-gym-accent transition-all ${setLog.completed ? 'opacity-50' : ''}`}
                                                placeholder={exercise.reps || '0'}
                                                disabled={setLog.completed || isLocked}
                                            />
                                        </div>
                                    </div>

                                    <div className="w-10 flex justify-center items-center">
                                        <button
                                            onClick={() => onToggleSet(exercise.id, index)}
                                            className={`transition-transform active:scale-90 ${setLog.completed ? 'text-gym-blue' : 'text-gray-500 hover:text-white'}`}
                                            disabled={isLocked}
                                        >
                                            {setLog.completed ? <CheckCircle size={28} className="drop-shadow-[0_0_10px_rgba(0,122,255,0.8)]" /> : <Circle size={28} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}


function TodayTab() {

    const { token, user: currentUser } = useAuthStore();
    const { activeSplitId, splits, logWorkout, workoutLog } = useGymStore();

    const validSplits = splits.filter(s => s.isDefault || !s._username || s._username === currentUser?.username);
    const activeSplitRaw = validSplits.find(s => s.id === activeSplitId);

    // Default to a fallback if split is missing, standardizing logic.
    const activeSplit = activeSplitRaw?.isDefault ? (defaultSplits.find(s => s.id === activeSplitRaw.id) || activeSplitRaw) : activeSplitRaw;

    const getFallbackSchedule = (days) => {
        if (!days || days.length === 0) return ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'];
        return [0, 1, 2, 3, 4, 5, 6].map(i => days[i % days.length]?.id || 'rest');
    };
    const activeSchedule = activeSplit?.schedule || getFallbackSchedule(activeSplit?.days);

    const todayIndex = new Date().getDay();
    const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);

    const scheduledDayId = activeSchedule[selectedDayIndex];
    const isRestDay = scheduledDayId === 'rest';

    const [exercises, setExercises] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [showCardioPrompt, setShowCardioPrompt] = useState(false);
    const [suggestions, setSuggestions] = useState({});
    const [needsRest, setNeedsRest] = useState(false);
    const [restSoftBypassed, setRestSoftBypassed] = useState(false);

    // Workout Lock Check
    const filteredWorkoutLog = workoutLog.filter(l => !l._username || l._username === currentUser?.username);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = filteredWorkoutLog.find(l => l.date === todayStr);
    const isLockedToday = !!todayLog;
    const isViewingTodaysCompletedLog = isLockedToday && (selectedDayIndex === todayIndex);

    useEffect(() => {
        if (activeSplit && scheduledDayId && !isRestDay) {
            const day = activeSplit.days.find(d => d.id === scheduledDayId);
            if (day) {
                setExercises(day.exercises.map(ex => ({
                    ...ex,
                    completed: false,
                    setLogs: Array.from({ length: ex.sets }).map(() => ({
                        reps: ex.reps || '',
                        weight: ex.weight || '',
                        completed: false
                    }))
                })));

                if (token && selectedDayIndex === todayIndex) {
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/workout/rest-advisory`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).then(res => res.json()).then(data => {
                        if (data.needsRest) setNeedsRest(true);
                    }).catch(e => { });

                    day.exercises.forEach(async (ex) => {
                        try {
                            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/workout/suggestion?exercise=${encodeURIComponent(ex.name)}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                                const data = await res.json();
                                if (data.suggestion) {
                                    setSuggestions(prev => ({ ...prev, [ex.name]: data.suggestion }));
                                }
                                if (data.pastSets && data.pastSets.length > 0) {
                                    setExercises(items => items.map(item => {
                                        if (item.id === ex.id) {
                                            const newSetLogs = item.setLogs.map((s, idx) => {
                                                if (data.pastSets[idx]) {
                                                    return { ...s, reps: data.pastSets[idx].reps || s.reps, weight: data.pastSets[idx].weight || s.weight };
                                                }
                                                return s;
                                            });
                                            return { ...item, setLogs: newSetLogs };
                                        }
                                        return item;
                                    }));
                                }
                            }
                        } catch (e) { }
                    });
                }
            }
        }
    }, [activeSplit, scheduledDayId, isRestDay, token, selectedDayIndex, todayIndex]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    if (!activeSplit) {
        return (
            <div className="text-center py-24 flex flex-col items-center">
                <p className="text-gray-400 font-mono mb-8 text-xl">No active routine selected.</p>
                <Link to="/templates" className="glass-button font-bold text-lg px-8 py-4 rounded-xl transition-transform">
                    View Library
                </Link>
            </div>
        );
    }

    const handleDragEnd = (event) => {
        if (isViewingTodaysCompletedLog || isLockedToday) return;
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setExercises((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleToggleSet = (exerciseId, setIndex) => {
        if (isViewingTodaysCompletedLog) return;
        if (selectedDayIndex !== todayIndex) {
            toast('You can only track today\'s workout.', { icon: 'ℹ️', style: { borderRadius: '10px', background: '#111', color: '#007AFF', border: '1px solid #333' } });
            return;
        }
        if (isLockedToday) {
            setShowLockModal(true);
            return;
        }

        setExercises(items => items.map(ex => {
            if (ex.id !== exerciseId) return ex;
            const newLogs = [...ex.setLogs];
            newLogs[setIndex] = { ...newLogs[setIndex], completed: !newLogs[setIndex].completed };
            return { ...ex, setLogs: newLogs };
        }));
    };

    const handleUpdateSet = (exerciseId, setIndex, field, value) => {
        setExercises(items => items.map(ex => {
            if (ex.id !== exerciseId) return ex;
            const newLogs = [...ex.setLogs];
            newLogs[setIndex] = { ...newLogs[setIndex], [field]: value };
            return { ...ex, setLogs: newLogs };
        }));
    };

    const handleCompleteDay = () => {
        if (isViewingTodaysCompletedLog) return;
        if (selectedDayIndex !== todayIndex) {
            toast.error('You can only complete today\'s workout.');
            return;
        }
        if (isLockedToday) {
            setShowLockModal(true);
            return;
        }

        const dayName = activeSplit.days.find(d => d.id === scheduledDayId)?.name || 'Workout';

        const payload = {
            splitId: activeSplit.id,
            dayId: String(scheduledDayId),
            dayName: dayName,
            exercises: exercises.map(ex => {

                // If they completed sets, take the max as the top-level stats for fallback backwards compatibility
                let finalSets = ex.sets;
                let finalReps = ex.reps;
                let finalWeight = ex.weight || 0.0;

                if (ex.setLogs && ex.setLogs.length > 0) {
                    const completedLogs = ex.setLogs.filter(s => s.completed);
                    if (completedLogs.length > 0) {
                        const maxWeightSet = completedLogs.reduce((prev, current) =>
                            (parseFloat(current.weight) || 0) > (parseFloat(prev.weight) || 0) ? current : prev
                        );
                        finalSets = completedLogs.length;
                        finalReps = parseInt(maxWeightSet.reps) || 0;
                        finalWeight = parseFloat(maxWeightSet.weight) || 0.0;
                    }
                }

                return {
                    name: ex.name,
                    sets: finalSets,
                    reps: finalReps,
                    weight: finalWeight,
                    setsList: ex.setLogs ? ex.setLogs.map((s, i) => ({
                        reps: parseInt(s.reps) || 0,
                        weight: parseFloat(s.weight) || 0.0
                    })) : []
                };
            })
        };

        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/workout/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        }).catch(err => console.error(err));

        toast.success(`${dayName} Completed!`, { icon: '🔥', style: { borderRadius: '12px', background: '#007AFF', color: '#FFF', fontWeight: 'bold' } });
        setExercises(items => items.map(ex => ({ ...ex, completed: true })));
        logWorkout(activeSplit.id, scheduledDayId);

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
        setTimeout(() => setShowCardioPrompt(true), 2500);
    };

    const isAllComplete = exercises.length > 0 && exercises.every(ex => ex.setLogs && ex.setLogs.every(s => s.completed));

    const nextDayId = activeSchedule[(todayIndex + 1) % 7];
    const nextDayName = nextDayId === 'rest' ? 'Rest Day 💤' : (activeSplit.days.find(d => d.id === nextDayId)?.name || 'Next Workout');

    const weekDaysList = [
        { index: 1, label: 'Mon' },
        { index: 2, label: 'Tue' },
        { index: 3, label: 'Wed' },
        { index: 4, label: 'Thu' },
        { index: 5, label: 'Fri' },
        { index: 6, label: 'Sat' },
        { index: 0, label: 'Sun' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-5xl mx-auto space-y-10 relative pb-12">
            {showConfetti && <div className="fixed inset-0 z-50 pointer-events-none"><Confetti recycle={false} numberOfPieces={800} gravity={0.2} colors={['#C8FF00', '#007AFF', '#FF3B30']} /></div>}

            {/* Lock Modal Overlay */}
            <AnimatePresence>
                {showLockModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowLockModal(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative glass-panel p-10 max-w-md w-full text-center">
                            <button onClick={() => setShowLockModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 rounded-full"><X size={20} /></button>
                            <span className="text-[60px] mb-4 block drop-shadow-lg">💪</span>
                            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Workout Complete!</h2>
                            <p className="text-gray-400 mb-8 text-sm leading-relaxed">Come back tomorrow for <strong className="text-gym-blue block mt-2 text-lg">{nextDayName}</strong><br />Rest, recover, and grow.</p>
                            <button onClick={() => setShowLockModal(false)} className="w-full glass-button font-bold text-lg py-4 rounded-xl uppercase">Got It</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rest Day Soft Block Modal Overlay */}
            <AnimatePresence>
                {needsRest && !restSoftBypassed && !isLockedToday && selectedDayIndex === todayIndex && !isRestDay && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative glass-panel p-10 max-w-md w-full text-center border-gym-red/50 shadow-[0_0_30px_rgba(255,59,48,0.2)]">
                            <span className="text-[60px] mb-4 block drop-shadow-lg">🛌</span>
                            <h2 className="text-2xl font-bold text-white mb-4">Fatigue Protocol</h2>
                            <p className="text-gray-400 mb-8 text-sm leading-relaxed">You have trained 5 or more days consecutively. Muscle is built during recovery, not in the gym.<br /><br />We strongly advise taking a Rest Day.</p>
                            <div className="space-y-4">
                                <Link to="/history" className="w-full glass-button bg-gym-blue/20 border-gym-blue/50 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center">Take a Rest Day</Link>
                                <button onClick={() => setRestSoftBypassed(true)} className="w-full text-gray-500 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors">Bypass & Train Anyway (Risk Injury)</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <header className="glass-panel p-6 sm:p-8 flex items-end justify-between bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-[#0B0B0B]/60 to-transparent"></div>
                <div className="relative z-10 w-full flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gym-blue tracking-tight mb-2 drop-shadow-[0_2px_15px_rgba(0,122,255,0.4)]">{activeSplit.name}</h1>
                        <p className="text-gray-300 font-mono tracking-wider text-sm">Scheduled protocol execution.</p>
                    </div>
                </div>
            </header>

            {/* Horizontal Week Strip (7 Days) - Glass Pills */}
            <div className="flex overflow-x-auto gap-4 sm:gap-5 pb-6 pt-2 snap-x scrollbar-hide px-2">
                {weekDaysList.map((wd) => {
                    const isActive = wd.index === selectedDayIndex;
                    const mappedDayId = activeSchedule[wd.index];
                    const isRest = mappedDayId === 'rest';
                    const activeDayTitle = isRest ? "REST" : (activeSplit.days.find(d => d.id === mappedDayId)?.name || 'Unknown');
                    const isPassedCompleted = isLockedToday && wd.index === todayIndex;

                    let structuralClass = 'bg-white/5 border border-white/5 text-gray-500 hover:bg-white/10 glass-panel-hover opacity-70';
                    let titleColor = 'text-gray-400';

                    if (isActive) {
                        if (isRest) {
                            structuralClass = 'bg-gym-red/10 border-gym-red/40 shadow-[0_4px_20px_rgba(255,59,48,0.2)] opacity-100 scale-[1.02] -translate-y-1';
                            titleColor = 'text-gym-red drop-shadow-sm font-bold';
                        } else {
                            structuralClass = 'bg-gym-blue/10 border-gym-blue/40 shadow-[0_4px_20px_rgba(0,122,255,0.2)] opacity-100 scale-[1.02] -translate-y-1';
                            titleColor = 'text-gym-blue drop-shadow-sm font-bold';
                        }
                    } else if (isRest) {
                        titleColor = 'text-gym-red/60';
                    } else {
                        titleColor = 'text-gray-300';
                    }

                    return (
                        <button
                            key={wd.index}
                            onClick={() => setSelectedDayIndex(wd.index)}
                            className={`snap-center shrink-0 min-w-[130px] sm:min-w-[150px] px-5 py-4 rounded-xl text-left transition-all duration-300 transform backdrop-blur-md ${structuralClass}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-500'}`}>{wd.label} {wd.index === todayIndex ? "• TODAY" : ""}</span>
                                {isPassedCompleted && !isRest && <div className="w-2 h-2 rounded-full bg-gym-green shadow-[0_0_8px_rgba(52,199,89,0.8)]"></div>}
                            </div>
                            <h3 className={`font-semibold text-lg sm:text-xl tracking-tight leading-tight mt-1 ${titleColor} truncate whitespace-normal`}>{activeDayTitle}</h3>
                        </button>
                    )
                })}
            </div>

            {/* Main Content Area */}
            {isRestDay ? (
                <div className="glass-panel p-8 sm:p-16 flex flex-col items-center justify-center text-center">
                    <span className="text-[80px] drop-shadow-lg mb-6">⛺</span>
                    <h2 className="text-3xl font-bold text-white mb-2">Rest Day</h2>
                    <p className="text-gray-400 font-mono text-sm max-w-md">Take it easy. Recovery is when the muscle actually rebuilds stronger for the next session.</p>
                </div>
            ) : (
                <div className={`glass-panel p-6 sm:p-10 transition-colors duration-500 relative ${isViewingTodaysCompletedLog ? 'border-gym-green/30 bg-gym-green/5' : (isAllComplete ? 'border-gym-accent/30 bg-gym-accent/5' : '')}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 gap-6">
                        <div className="flex-1">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">{activeSplit.days.find(d => d.id === scheduledDayId)?.name}</h2>
                            {isViewingTodaysCompletedLog && <p className="text-gym-green font-mono text-sm mt-1 uppercase tracking-widest flex items-center gap-2"><CheckCircle size={14} /> Completed</p>}
                        </div>

                        {selectedDayIndex === todayIndex && (
                            <button
                                onClick={handleCompleteDay}
                                disabled={exercises.length === 0 || isViewingTodaysCompletedLog}
                                className={`font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-xl flex-shrink-0 w-full sm:w-auto transition-all ${isViewingTodaysCompletedLog ? 'bg-gym-green/20 text-gym-green border border-gym-green/30 cursor-not-allowed' : 'glass-button bg-gym-blue/20 hover:bg-gym-blue/30 border-gym-blue/50 text-white shadow-[0_0_20px_rgba(0,122,255,0.2)]'}`}
                            >
                                {isViewingTodaysCompletedLog ? 'Session Locked' : 'Finish Workout'}
                            </button>
                        )}
                        {selectedDayIndex !== todayIndex && (
                            <span className="text-gray-500 font-mono tracking-widest text-xs uppercase bg-white/5 border border-white/10 px-4 py-2 rounded-lg w-full sm:w-auto text-center flex-shrink-0">Read Only</span>
                        )}
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={exercises} strategy={verticalListSortingStrategy}>
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {exercises.map(exercise => (
                                        <motion.div key={exercise.id} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                                            <SortableExercise
                                                exercise={exercise}
                                                onToggleSet={handleToggleSet}
                                                onUpdateSet={handleUpdateSet}
                                                onOpenVideo={() => setSelectedVideo(exercise.name)}
                                                isLocked={isViewingTodaysCompletedLog || selectedDayIndex !== todayIndex}
                                                suggestion={suggestions[exercise.name]}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {exercises.length === 0 && (
                                    <div className="text-center py-24 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                                        <p className="text-gray-500 font-mono tracking-widest text-sm uppercase">No Exercises Configured.</p>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            <YoutubeModal exerciseName={selectedVideo} isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
            <CardioPromptModal isOpen={showCardioPrompt} onClose={() => setShowCardioPrompt(false)} />
        </motion.div>
    );
}

function PRsTab() {

    const { token } = useAuthStore();
    const [prs, setPrs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPRs();
    }, [token]);

    const fetchPRs = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/prs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPrs(data);
            } else {
                toast.error("Failed to load PRs");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gym-blue"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="pb-12 max-w-5xl mx-auto">
            <header className="mb-10 text-center">
                <h1 className="text-5xl font-bebas text-white tracking-widest drop-shadow-md">
                    Personal Records
                </h1>
                <p className="text-gray-400 mt-2 font-mono text-sm uppercase">Your best performances logged in the system.</p>
            </header>

            {prs.length === 0 ? (
                <div className="text-center py-20 glass-panel max-w-lg mx-auto">
                    <p className="text-5xl mb-4">🏆</p>
                    <p className="text-white font-bold text-xl mb-2">No Personal Records Yet</p>
                    <p className="text-gray-400 font-mono text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                        PRs are automatically tracked when you complete a workout and hit a new max weight or rep count. Start training to earn your first record!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {prs.map((pr) => (
                        <div key={pr.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between group hover:border-[#00E5FF]/40 transition-colors">
                            <div className="mb-4">
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-1 line-clamp-1">{pr.exerciseName}</p>
                                <p className="text-3xl font-bold text-white uppercase truncate">{pr.maxWeight}<span className="text-sm font-mono text-gray-500 ml-1">kg</span></p>
                            </div>

                            <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Max Reps</p>
                                    <p className="text-lg font-bold text-gym-accent">{pr.maxRepsAtWeight}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Achieved</p>
                                    <p className="text-sm font-mono text-gray-300">
                                        {pr.dateAchieved ? new Date(pr.dateAchieved).toLocaleDateString() : '--'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function RoutinesTab() {

    const { splits, setActiveSplitId, deleteCustomSplit } = useGymStore();
    const navigate = useNavigate();
    const [loadingId, setLoadingId] = useState(null);
    const [flippedId, setFlippedId] = useState(null);

    const currentUser = useAuthStore(state => state.user);
    const validSplits = splits.filter(s => s.isDefault || !s._username || s._username === currentUser?.username);

    const defaultSplits = validSplits.filter(s => s.isDefault);
    const customSplits = validSplits.filter(s => !s.isDefault);

    const analyzeSplit = (split) => {
        const uniqueWorkoutDays = split.days.length;
        const activeDaysPerWeek = split.schedule ? Object.values(split.schedule).filter(id => id !== 'rest').length : uniqueWorkoutDays;

        let advantages = [];
        let disadvantages = [];

        if (activeDaysPerWeek >= 6) {
            advantages = ["Maximized muscle protein synthesis freq.", "Highest weekly caloric expenditure"];
            disadvantages = ["Requires elite recovery & sleep habits", "High risk of central nervous fatigue"];
        } else if (activeDaysPerWeek === 5) {
            advantages = ["High weekly volume capacity", "Great isolation for specific muscles"];
            disadvantages = ["Leaves little room for missed days", "Requires strict nutrition compliance"];
        } else if (activeDaysPerWeek === 4) {
            advantages = ["Perfect balance of volume & recovery", "Flexible scheduling for busy lives"];
            disadvantages = ["Workouts may be slightly longer", "Intensity must be kept very high"];
        } else {
            advantages = ["Maximum central nervous system recovery", "Highly sustainable long-term"];
            disadvantages = ["Lower total weekly muscle stimulation", "Progress may be slower for advanced athletes"];
        }

        const name = split.name.toLowerCase();
        if (name.includes('bro') || name.includes('body part')) {
            advantages.push("Insane localized muscle pumps");
            disadvantages.push("Muscles only hit 1x per week");
        }
        if (name.includes('full') || name.includes('5/3/1')) {
            advantages.push("Rapid strength & compound development");
            disadvantages.push("High systemic fatigue per session");
        }

        return { advantages: advantages.slice(0, 2), disadvantages: disadvantages.slice(0, 2) };
    };

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
        const analysis = analyzeSplit(split);
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
                        <div className="relative z-10 flex flex-col h-full">

                            <div className="grid grid-cols-2 gap-3 mb-4 mt-2">
                                <div>
                                    <p className="text-[11px] text-[#00E5FF] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"><Plus size={12} /> Pros</p>
                                    <ul className="text-xs text-gray-300 space-y-1.5 leading-tight list-disc pl-3">
                                        {analysis.advantages.map((adv, i) => <li key={i}>{adv}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#FF0055] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1"><X size={12} /> Cons</p>
                                    <ul className="text-xs text-gray-300 space-y-1.5 leading-tight list-disc pl-3">
                                        {analysis.disadvantages.map((dis, i) => <li key={i}>{dis}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <h3 className="text-sm font-bebas tracking-wide text-[#C8FF00] mb-2 border-b border-[#C8FF00]/20 pb-1 mt-1">Structure ({split.days.length} Days)</h3>
                            <div className="space-y-1.5 overflow-y-auto pr-2 custom-scrollbar max-h-[70px]">
                                {split.days.map((d, i) => (
                                    <div key={d.id} className="text-xs pb-1 flex justify-between items-end border-b border-gym-border/50 border-dashed">
                                        <span className="text-gray-200 font-medium truncate pr-2">{d.name}</span>
                                        <span className="text-gray-500 font-mono text-[10px] uppercase whitespace-nowrap">{d.exercises.length} ex</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 mt-auto pt-4 relative z-20" onClick={(e) => e.stopPropagation()}>
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

const TABS = [
  { id: 'today',    label: "Today's Workout", icon: Calendar },
  { id: 'prs',      label: 'Personal Records', icon: Trophy },
  { id: 'routines', label: 'Routines',          icon: LayoutList },
];

export default function TrainingHub() {
  const [active, setActive] = useState('today');
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
      {active === 'today'    && <TodayTab />}
      {active === 'prs'      && <PRsTab />}
      {active === 'routines' && <RoutinesTab />}
    </div>
  );
}
