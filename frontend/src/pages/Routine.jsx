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

function SortableExercise({ exercise, onToggle, onOpenVideo, isLocked }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exercise.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const isChecked = isLocked || exercise.completed;

    return (
        <div ref={setNodeRef} style={style} className={`bg-gym-gray border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 transform ${isChecked ? 'border-[#00E676] opacity-80' : 'border-gym-border'} ${isLocked ? 'cursor-not-allowed' : 'hover:scale-[1.01]'}`}>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div {...attributes} {...listeners} className={`cursor-grab shrink-0 ${isLocked ? 'pointer-events-none opacity-0' : 'text-gray-500 hover:text-white'}`}>
                    <GripVertical size={20} />
                </div>

                <button onClick={() => onToggle(exercise.id)} className={`transition-transform active:scale-95 shrink-0 ${isLocked ? 'cursor-not-allowed cursor-default' : 'text-[#C8FF00]'}`}>
                    {isChecked ? <CheckCircle size={24} className="text-[#00E676]" /> : <Circle size={24} className="text-gray-400 hover:text-white" />}
                </button>
                <div className="flex-1 sm:hidden">
                    <h4 className={`text-base font-bold uppercase transition-all ${isChecked ? 'line-through text-gray-400' : 'text-white'}`}>
                        {exercise.name}
                    </h4>
                </div>
                <button onClick={onOpenVideo} className="text-[#C8FF00] hover:text-white p-2 sm:hidden shrink-0 ml-auto" title="Watch Tutorial">
                    <PlayCircle size={24} />
                </button>
            </div>

            <div className="flex-1 hidden sm:block ml-2">
                <h4 className={`text-xl font-bebas tracking-wide uppercase transition-all ${isChecked ? 'line-through text-gray-500' : 'text-white'}`}>
                    {exercise.name}
                </h4>
                <p className="text-sm font-mono text-gray-400 mt-1">
                    {exercise.sets} SETS × {exercise.reps} REPS {exercise.weight ? `| ${exercise.weight}` : ''}
                </p>
            </div>

            <div className="sm:hidden pl-12">
                <p className="text-sm font-mono text-gray-400">
                    {exercise.sets} SETS × {exercise.reps} REPS {exercise.weight ? `| ${exercise.weight}` : ''}
                </p>
            </div>

            <button onClick={onOpenVideo} className="text-[#C8FF00] hover:text-white p-2 hidden sm:block shrink-0" title="Watch Tutorial">
                <PlayCircle size={28} />
            </button>
        </div>
    );
}

export default function Routine() {
    const { activeSplitId, splits, logWorkout, workoutLog } = useGymStore();
    const activeSplit = splits.find(s => s.id === activeSplitId);

    const todayIndex = new Date().getDay();
    const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);

    const scheduledDayId = activeSplit?.schedule ? activeSplit.schedule[selectedDayIndex] : null;
    const isRestDay = scheduledDayId === 'rest';

    const [exercises, setExercises] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);

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
            }
        }
    }, [activeSplit, scheduledDayId, isRestDay]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    if (!activeSplit) {
        return (
            <div className="text-center py-20 flex flex-col items-center">
                <p className="text-gray-400 mb-6 text-xl">No active routine selected.</p>
                <Link to="/splits" className="bg-[#C8FF00] text-black font-bebas text-2xl tracking-widest py-4 px-10 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(200,255,0,0.3)]">
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
            // Cannot modify non-today. Can just toggle view state visually if wanted, but best to block.
            toast('You can only track today\'s workout.', { icon: 'ℹ️', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
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

        const dayName = activeSplit.days.find(d => d.id === scheduledDayId).name;
        toast.success(`${dayName} Completed!`, { icon: '🔥' });
        setExercises(items => items.map(ex => ({ ...ex, completed: true })));
        logWorkout(activeSplit.id, scheduledDayId);

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
    };

    const isAllComplete = exercises.length > 0 && exercises.every(ex => ex.completed);

    // Find Next Day Name for the Lock Modal
    const nextDayId = activeSplit.schedule ? activeSplit.schedule[(todayIndex + 1) % 7] : null;
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
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8 relative pb-24">
            {showConfetti && <div className="fixed inset-0 z-50 pointer-events-none"><Confetti recycle={false} numberOfPieces={600} gravity={0.15} /></div>}

            {/* Lock Modal Overlay */}
            <AnimatePresence>
                {showLockModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLockModal(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-gym-surfaceElevated border border-gym-border p-8 rounded-3xl max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center">
                            <button onClick={() => setShowLockModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                            <span className="text-6xl mb-4 block">💪</span>
                            <h2 className="text-3xl font-bebas text-white tracking-widest mb-4">You've already crushed today's workout!</h2>
                            <p className="text-gray-400 mb-6 font-medium">Come back tomorrow for <strong className="text-[#C8FF00]">{nextDayName}</strong>. Rest, recover, and grow.</p>
                            <button onClick={() => setShowLockModal(false)} className="w-full bg-[#C8FF00] text-black font-bold uppercase tracking-wide py-3 rounded-xl hover:bg-[#a6d900] transition-colors">Understood, Boss</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-bebas text-white tracking-widest uppercase mb-1 drop-shadow-md">{activeSplit.name}</h1>
                    <p className="text-gray-400">Track your weekly scheduled workouts and rest days.</p>
                </div>
            </header>

            {/* Horizontal Week Strip (7 Days) */}
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                {weekDaysList.map((wd) => {
                    const isActive = wd.index === selectedDayIndex;
                    const mappedDayId = activeSplit.schedule ? activeSplit.schedule[wd.index] : null;
                    const isRest = mappedDayId === 'rest';
                    const activeDayTitle = isRest ? "Rest Day" : (activeSplit.days.find(d => d.id === mappedDayId)?.name || 'Unknown');
                    const isPassedCompleted = isLockedToday && wd.index === todayIndex;

                    let bgClass = 'bg-gym-surface/50 border-gym-border hover:border-gray-500 hover:bg-gym-surface text-white';
                    let titleColor = 'text-white';

                    if (isActive) {
                        if (isRest) {
                            bgClass = 'bg-blue-900/30 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-105 text-white';
                            titleColor = 'text-blue-400';
                        } else {
                            bgClass = 'bg-gym-surface border-[#C8FF00] shadow-[0_0_15px_rgba(200,255,0,0.15)] scale-105';
                            titleColor = 'text-[#C8FF00]';
                        }
                    } else if (isRest) {
                        titleColor = 'text-blue-400/70';
                    }

                    return (
                        <button
                            key={wd.index}
                            onClick={() => setSelectedDayIndex(wd.index)}
                            className={`snap-center shrink-0 min-w-[130px] p-4 rounded-2xl border text-left transition-all duration-300 transform ${bgClass}`}
                        >
                            <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">{wd.label} {wd.index === todayIndex ? "(Today)" : ""}</span>
                            <h3 className={`font-bebas text-2xl tracking-wide uppercase leading-none ${titleColor}`}>{activeDayTitle}</h3>
                            {isPassedCompleted && !isRest && <p className="text-xs text-[#00E676] font-bold mt-2 uppercase">Completed</p>}
                        </button>
                    )
                })}
            </div>

            {/* Main Content Area */}
            {isRestDay ? (
                <RestDay />
            ) : (
                <div className={`transform perspective-[1000px] hover:rotate-x-1 transition-transform duration-700 bg-gym-surface/30 backdrop-blur-md border p-6 sm:p-8 rounded-3xl shadow-2xl ${isViewingTodaysCompletedLog ? 'border-[#00E676]/50 shadow-[0_0_30px_rgba(0,230,118,0.1)]' : (isAllComplete ? 'border-[#C8FF00]' : 'border-gym-border')}`}>
                    <div className="flex justify-between items-center mb-8 border-b border-gym-border pb-6 flex-wrap gap-4">
                        <h2 className="text-3xl font-bebas uppercase text-white tracking-widest">{activeSplit.days.find(d => d.id === scheduledDayId)?.name}</h2>

                        {selectedDayIndex === todayIndex && (
                            <button
                                onClick={handleCompleteDay}
                                disabled={exercises.length === 0 || isViewingTodaysCompletedLog}
                                className={`font-bebas text-xl tracking-widest uppercase py-3 px-8 rounded-xl transition-all ${isViewingTodaysCompletedLog ? 'bg-gym-surface border border-[#00E676] text-[#00E676] cursor-not-allowed opacity-80' : 'bg-[#C8FF00] text-black hover:bg-[#a6d900] active:scale-95 shadow-[0_4px_15px_rgba(200,255,0,0.3)]'} disabled:opacity-50`}
                            >
                                {isViewingTodaysCompletedLog ? 'SEE SESSION (LOCKED)' : 'COMPLETE DAY'}
                            </button>
                        )}
                        {selectedDayIndex !== todayIndex && (
                            <span className="text-gray-500 font-bebas tracking-widest text-lg uppercase bg-black/20 px-4 py-2 rounded-lg">View Only</span>
                        )}
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={exercises} strategy={verticalListSortingStrategy}>
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {exercises.map(exercise => (
                                        <motion.div key={exercise.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                                            <SortableExercise
                                                exercise={exercise}
                                                onToggle={handleToggle}
                                                onOpenVideo={() => setSelectedVideo(exercise.name)}
                                                isLocked={isViewingTodaysCompletedLog || selectedDayIndex !== todayIndex}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {exercises.length === 0 && (
                                    <div className="text-center py-16 bg-gym-surface rounded-2xl border border-dashed border-gym-border">
                                        <p className="text-gray-500 font-mono">No exercises found for this day.</p>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            <YoutubeModal exerciseName={selectedVideo} isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
        </motion.div>
    );
}
