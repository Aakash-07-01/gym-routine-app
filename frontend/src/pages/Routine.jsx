import { useState, useEffect } from 'react';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, CheckCircle, Circle, PlayCircle, X } from 'lucide-react';
import useGymStore from '../store/gymStore';
import toast from 'react-hot-toast';
import YoutubeModal from '../components/YoutubeModal';
import Confetti from 'react-confetti';
import { Link } from 'react-router-dom';
import RestDay from '../components/RestDay';
import { defaultSplits } from '../data/defaultSplits';
import CardioPromptModal from '../components/CardioPromptModal';
import useAuthStore from '../store/authStore';

function SortableExercise({ exercise, onToggle, onOpenVideo, isLocked, suggestion }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exercise.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const isChecked = isLocked || exercise.completed;

    return (
        <div ref={setNodeRef} style={style} className={`glass-panel p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 ${isChecked ? 'border-gym-blue/40 opacity-80 bg-gym-blue/5' : 'glass-panel-hover'} ${isLocked ? 'cursor-not-allowed' : ''}`}>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div {...attributes} {...listeners} className={`cursor-grab shrink-0 ${isLocked ? 'pointer-events-none opacity-0' : 'text-gray-500 hover:text-white'}`}>
                    <GripVertical size={20} />
                </div>

                <button onClick={() => onToggle(exercise.id)} className={`transition-transform active:scale-95 shrink-0 ${isLocked ? 'cursor-not-allowed cursor-default' : 'text-gym-blue'}`}>
                    {isChecked ? <CheckCircle size={28} className="text-gym-blue drop-shadow-[0_0_10px_rgba(0,122,255,0.6)]" /> : <Circle size={28} className="text-gray-400 hover:text-white" />}
                </button>
                <div className="flex-1 sm:hidden">
                    <h4 className={`text-base font-bold tracking-wide transition-all ${isChecked ? 'line-through text-gray-500' : 'text-white'}`}>
                        {exercise.name}
                    </h4>
                </div>
                <button onClick={onOpenVideo} className="text-gym-red hover:text-white p-2 sm:hidden shrink-0 ml-auto" title="Watch Tutorial">
                    <PlayCircle size={28} />
                </button>
            </div>

            <div className="flex-1 hidden sm:block ml-2 w-full max-w-sm">
                {suggestion && !isChecked && (
                    <div className="text-[10px] text-gym-red font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        🚀 {suggestion}
                    </div>
                )}
                <h4 className={`text-xl font-bold tracking-wide transition-all ${isChecked ? 'line-through text-gray-600' : 'text-white drop-shadow-sm'} truncate`}>
                    {exercise.name}
                </h4>
                <p className="text-sm font-mono text-gym-accent font-bold mt-1 tracking-widest">
                    {exercise.sets} SETS × {exercise.reps} REPS {exercise.weight ? `| ${exercise.weight}` : ''}
                </p>
            </div>

            <div className="sm:hidden pl-12 mt-1">
                <p className="text-sm font-mono text-gym-accent font-bold tracking-widest">
                    {exercise.sets} SETS × {exercise.reps} REPS {exercise.weight ? `| ${exercise.weight}` : ''}
                </p>
            </div>

            <button onClick={onOpenVideo} className="text-gym-red hover:text-white hover:scale-110 transition-transform p-3 hidden sm:block shrink-0 drop-shadow-[0_0_8px_rgba(255,59,48,0.3)] ml-auto" title="Watch Tutorial">
                <PlayCircle size={32} />
            </button>
        </div>
    );
}

export default function Routine() {
    const { token } = useAuthStore();
    const { activeSplitId, splits, logWorkout, workoutLog } = useGymStore();
    const activeSplitRaw = splits.find(s => s.id === activeSplitId);

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
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = workoutLog.find(l => l.date === todayStr);
    const isLockedToday = !!todayLog;
    const isViewingTodaysCompletedLog = isLockedToday && (selectedDayIndex === todayIndex);

    useEffect(() => {
        if (activeSplit && scheduledDayId && !isRestDay) {
            const day = activeSplit.days.find(d => d.id === scheduledDayId);
            if (day) {
                setExercises(day.exercises.map(ex => ({ ...ex, completed: false })));

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

    const handleToggle = (id) => {
        if (isViewingTodaysCompletedLog) return;
        if (selectedDayIndex !== todayIndex) {
            toast('You can only track today\'s workout.', { icon: 'ℹ️', style: { borderRadius: '10px', background: '#111', color: '#007AFF', border: '1px solid #333' } });
            return;
        }
        if (isLockedToday) {
            setShowLockModal(true);
            return;
        }
        setExercises(items => items.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex));
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
            exercises: exercises.map(ex => ({
                name: ex.name,
                sets: parseInt(ex.sets),
                reps: parseInt(ex.reps),
                weight: parseFloat(ex.weight) || 0.0
            }))
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

    const isAllComplete = exercises.length > 0 && exercises.every(ex => ex.completed);

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
                                                onToggle={handleToggle}
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
