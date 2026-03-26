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

function SortableExercise({ exercise, onToggle, onOpenVideo, isLocked, suggestion }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exercise.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const isChecked = isLocked || exercise.completed;

    return (
        <div ref={setNodeRef} style={style} className={`card-3d-item p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 transform ${isChecked ? 'border-[#00E5FF]/40 border-b-[#00E5FF]/20 opacity-90 grayscale-[30%]' : 'hover:-translate-y-1 hover:border-[#FF0055]/50'} ${isLocked ? 'cursor-not-allowed' : ''}`}>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div {...attributes} {...listeners} className={`cursor-grab shrink-0 ${isLocked ? 'pointer-events-none opacity-0' : 'text-gray-500 hover:text-white'}`}>
                    <GripVertical size={20} />
                </div>

                <button onClick={() => onToggle(exercise.id)} className={`transition-transform active:scale-95 shrink-0 ${isLocked ? 'cursor-not-allowed cursor-default' : 'text-[#00E5FF]'}`}>
                    {isChecked ? <CheckCircle size={28} className="text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" /> : <Circle size={28} className="text-gray-400 hover:text-white" />}
                </button>
                <div className="flex-1 sm:hidden">
                    <h4 className={`text-base font-bold uppercase tracking-wider transition-all ${isChecked ? 'line-through text-gray-500' : 'text-white drop-shadow-sm'}`}>
                        {exercise.name}
                    </h4>
                </div>
                <button onClick={onOpenVideo} className="text-[#FF0055] hover:text-white p-2 sm:hidden shrink-0 ml-auto" title="Watch Tutorial">
                    <PlayCircle size={28} />
                </button>
            </div>

            <div className="flex-1 hidden sm:block ml-2">
                {suggestion && !isChecked && (
                    <div className="text-[10px] text-[#FF0055] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        🚀 {suggestion}
                    </div>
                )}
                <h4 className={`text-2xl font-bebas tracking-widest uppercase transition-all ${isChecked ? 'line-through text-gray-600' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'}`}>
                    {exercise.name}
                </h4>
                <p className="text-sm font-mono text-[#C8FF00] font-bold mt-1 tracking-widest">
                    {exercise.sets} SETS × {exercise.reps} REPS {exercise.weight ? `| ${exercise.weight}` : ''}
                </p>
            </div>

            <div className="sm:hidden pl-12 mt-1">
                <p className="text-sm font-mono text-[#C8FF00] font-bold tracking-widest">
                    {exercise.sets} SETS × {exercise.reps} REPS {exercise.weight ? `| ${exercise.weight}` : ''}
                </p>
            </div>

            <button onClick={onOpenVideo} className="text-[#FF0055] hover:text-white hover:scale-110 transition-transform p-3 hidden sm:block shrink-0 drop-shadow-[0_0_10px_rgba(255,0,85,0.3)]" title="Watch Tutorial">
                <PlayCircle size={32} />
            </button>
        </div>
    );
}

import { defaultSplits } from '../data/defaultSplits';
import CardioPromptModal from '../components/CardioPromptModal';
import useAuthStore from '../store/authStore';

export default function Routine() {
    const { token } = useAuthStore();
    const { activeSplitId, splits, logWorkout, workoutLog } = useGymStore();
    const activeSplitRaw = splits.find(s => s.id === activeSplitId);

    // FIX: Fallback to reading fresh schedule mapped default data if missing from older saved localStorage state.
    const activeSplit = activeSplitRaw?.isDefault ? (defaultSplits.find(s => s.id === activeSplitRaw.id) || activeSplitRaw) : activeSplitRaw;

    // Safety fallback for custom templates
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
    const isViewingTodaysCompletedLog = isLockedToday && (selectedDayIndex === todayIndex); // Disable interactions if viewing today and it's locked

    useEffect(() => {
        if (activeSplit && scheduledDayId && !isRestDay) {
            const day = activeSplit.days.find(d => d.id === scheduledDayId);
            if (day) {
                setExercises(day.exercises.map(ex => ({ ...ex, completed: false })));

                if (token && selectedDayIndex === todayIndex) {
                    // Check rest advisory
                    fetch('http://localhost:8080/api/workout/rest-advisory', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).then(res => res.json()).then(data => {
                        if (data.needsRest) setNeedsRest(true);
                    }).catch(e => { });

                    day.exercises.forEach(async (ex) => {
                        try {
                            const res = await fetch(`http://localhost:8080/api/workout/suggestion?exercise=${encodeURIComponent(ex.name)}`, {
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
                <Link to="/splits" className="btn-3d-cyan text-black font-bebas text-3xl tracking-widest py-4 px-12 rounded-xl transition-transform">
                    Find a Routine
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
            toast('You can only track today\'s workout.', { icon: 'ℹ️', style: { borderRadius: '10px', background: '#333', color: '#00E5FF' } });
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

        fetch('http://localhost:8080/api/workout/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        }).catch(err => console.error(err));

        toast.success(`${dayName} Completed!`, { icon: '🔥', style: { borderRadius: '12px', background: '#00E5FF', color: '#000', fontWeight: 'bold' } });
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
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-5xl mx-auto space-y-10 relative pb-32">
            {showConfetti && <div className="fixed inset-0 z-50 pointer-events-none"><Confetti recycle={false} numberOfPieces={800} gravity={0.2} colors={['#C8FF00', '#00E5FF', '#FF0055']} /></div>}

            {/* Lock Modal Overlay */}
            <AnimatePresence>
                {showLockModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowLockModal(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative card-3d p-10 max-w-md w-full text-center">
                            <button onClick={() => setShowLockModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white bg-black p-2 rounded-full"><X size={20} /></button>
                            <span className="text-[80px] mb-4 block drop-shadow-xl">💪</span>
                            <h2 className="text-4xl font-bebas text-white tracking-widest mb-4">You've already crushed today's workout!</h2>
                            <p className="text-gray-400 mb-8 font-mono text-sm leading-relaxed">Come back tomorrow for <strong className="text-[#00E5FF] text-base">{nextDayName}</strong>.<br />Rest, recover, and grow.</p>
                            <button onClick={() => setShowLockModal(false)} className="w-full btn-3d-cyan text-black font-bebas text-2xl tracking-widest py-4 rounded-xl">Understood, Boss</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Rest Day Soft Block Modal Overlay */}
            <AnimatePresence>
                {needsRest && !restSoftBypassed && !isLockedToday && selectedDayIndex === todayIndex && !isRestDay && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative card-3d p-10 max-w-md w-full text-center border-[#FF0055]">
                            <span className="text-[80px] mb-4 block drop-shadow-xl">🛌</span>
                            <h2 className="text-4xl font-bebas text-white tracking-widest mb-4">Central Nervous System Fatigue Protocol!</h2>
                            <p className="text-gray-400 mb-8 font-mono text-sm leading-relaxed">You have trained 5 or more days consecutively. Muscle is built during recovery, not in the gym.<br /><br />We strongly advise taking a Rest Day.</p>
                            <div className="space-y-4">
                                <Link to="/history" className="w-full btn-3d-cyan text-black font-bebas text-2xl tracking-widest py-4 rounded-xl flex items-center justify-center">Take a Rest Day</Link>
                                <button onClick={() => setRestSoftBypassed(true)} className="w-full text-gray-500 font-bebas tracking-widest uppercase hover:text-white transition-colors">Bypass & Train Anyway (Not Recommended)</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <header className="flex justify-between items-end bg-gym-surfaceElevated p-6 rounded-[2rem] border-b-4 border-gym-border shadow-2xl">
                <div>
                    <h1 className="text-6xl font-bebas text-[#C8FF00] tracking-widest uppercase mb-2 drop-shadow-[0_2px_10px_rgba(200,255,0,0.3)]">{activeSplit.name}</h1>
                    <p className="text-gray-300 font-mono tracking-wider text-sm">Track your weekly scheduled workouts and rest days.</p>
                </div>
            </header>

            {/* Horizontal Week Strip (7 Days) - 3D Blocks */}
            <div className="flex overflow-x-auto gap-5 pb-8 pt-4 snap-x hide-scrollbar px-2">
                {weekDaysList.map((wd) => {
                    const isActive = wd.index === selectedDayIndex;
                    const mappedDayId = activeSchedule[wd.index];
                    const isRest = mappedDayId === 'rest';
                    const activeDayTitle = isRest ? "REST" : (activeSplit.days.find(d => d.id === mappedDayId)?.name || 'Unknown');
                    const isPassedCompleted = isLockedToday && wd.index === todayIndex;

                    let structuralClass = 'bg-[#151515] border-2 border-[#222] border-b-4 border-b-[#000] text-gray-500 hover:translate-y-[-2px] hover:border-[#444]';
                    let titleColor = 'text-gray-400';

                    if (isActive) {
                        if (isRest) {
                            structuralClass = 'bg-[#1A1A1A] border-2 border-l-[#FF0055]/50 border-t-[#FF0055]/50 border-r-[#AA0039] border-b-6 border-b-[#AA0039] text-white shadow-[0_15px_30px_rgba(255,0,85,0.4)] scale-105 -translate-y-1';
                            titleColor = 'text-[#FF0055] drop-shadow-[0_0_8px_rgba(255,0,85,0.8)]';
                        } else {
                            structuralClass = 'bg-[#1A1A1A] border-2 border-l-[#00E5FF]/50 border-t-[#00E5FF]/50 border-r-[#0099AA] border-b-6 border-b-[#0099AA] text-white shadow-[0_15px_30px_rgba(0,229,255,0.3)] scale-105 -translate-y-1';
                            titleColor = 'text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]';
                        }
                    } else if (isRest) {
                        titleColor = 'text-[#FF0055]/50';
                    }

                    return (
                        <button
                            key={wd.index}
                            onClick={() => setSelectedDayIndex(wd.index)}
                            className={`snap-center shrink-0 min-w-[140px] px-5 py-6 rounded-2xl text-left transition-all duration-300 transform ${structuralClass}`}
                        >
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">{wd.label} {wd.index === todayIndex ? "• TODAY" : ""}</span>
                            <h3 className={`font-bebas text-3xl tracking-widest uppercase leading-none ${titleColor} break-words whitespace-normal`}>{activeDayTitle}</h3>
                            {isPassedCompleted && !isRest && <div className="mt-4 bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF] px-2 py-1 rounded inline-block text-[10px] font-bold uppercase tracking-widest">Completed</div>}
                        </button>
                    )
                })}
            </div>

            {/* Main Content Area */}
            {isRestDay ? (
                <RestDay />
            ) : (
                <div className={`card-3d p-6 sm:p-10 ${isViewingTodaysCompletedLog ? 'border-[#00E5FF] shadow-[0_20px_40px_rgba(0,229,255,0.2)]' : (isAllComplete ? 'border-[#C8FF00]' : '')}`}>
                    <div className="flex justify-between items-center mb-10 border-b-2 border-[#222] pb-6 flex-wrap gap-4">
                        <h2 className="text-4xl font-bebas uppercase text-white tracking-widest drop-shadow-md">{activeSplit.days.find(d => d.id === scheduledDayId)?.name}</h2>

                        {selectedDayIndex === todayIndex && (
                            <button
                                onClick={handleCompleteDay}
                                disabled={exercises.length === 0 || isViewingTodaysCompletedLog}
                                className={`text-black font-bebas text-2xl tracking-widest uppercase px-10 py-3 rounded-xl ${isViewingTodaysCompletedLog ? 'bg-[#00E5FF] shadow-[0_4px_0_0_#0099AA] opacity-70 cursor-not-allowed hover:none translate-y-1' : 'btn-3d-lime'}`}
                            >
                                {isViewingTodaysCompletedLog ? 'SESSION LOCKED' : 'COMPLETE DAY'}
                            </button>
                        )}
                        {selectedDayIndex !== todayIndex && (
                            <span className="text-gray-500 font-bebas tracking-widest text-xl uppercase bg-black px-6 py-3 rounded-xl border-b-4 border-[#111]">View Only</span>
                        )}
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={exercises} strategy={verticalListSortingStrategy}>
                            <div className="space-y-5">
                                <AnimatePresence>
                                    {exercises.map(exercise => (
                                        <motion.div key={exercise.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
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
                                    <div className="text-center py-20 bg-black/40 rounded-3xl border-2 border-dashed border-[#333]">
                                        <p className="text-gray-500 font-mono tracking-widest text-lg">NO EXERCISES FOUND</p>
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
