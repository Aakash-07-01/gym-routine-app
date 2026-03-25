import { useState, useEffect } from 'react';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import useGymStore from '../store/gymStore';
import toast from 'react-hot-toast';
import YoutubeModal from '../components/YoutubeModal';
import Confetti from 'react-confetti';
import { Link } from 'react-router-dom';

function SortableExercise({ exercise, onToggle, onOpenVideo }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exercise.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className={`bg-gym-gray border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${exercise.completed ? 'border-gym-green opacity-70' : 'border-gym-light'}`}>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white shrink-0">
                    <GripVertical size={20} />
                </div>

                <button onClick={() => onToggle(exercise.id)} className="text-gym-green transition-transform active:scale-95 shrink-0">
                    {exercise.completed ? <CheckCircle size={24} /> : <Circle size={24} className="text-gray-500 hover:text-white" />}
                </button>
                <div className="flex-1 sm:hidden">
                    <h4 className={`text-base font-bold uppercase transition-all ${exercise.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {exercise.name}
                    </h4>
                </div>
                <button onClick={onOpenVideo} className="text-gym-blue hover:text-white p-2 sm:hidden shrink-0 ml-auto" title="Watch Tutorial">
                    <PlayCircle size={24} />
                </button>
            </div>

            <div className="flex-1 hidden sm:block ml-2">
                <h4 className={`text-lg font-bold uppercase transition-all ${exercise.completed ? 'line-through text-gray-500' : 'text-white'}`}>
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

            <button onClick={onOpenVideo} className="text-gym-blue hover:text-white p-2 hidden sm:block shrink-0" title="Watch Tutorial">
                <PlayCircle size={24} />
            </button>
        </div>
    );
}

export default function Routine() {
    const { activeSplitId, splits, logWorkout } = useGymStore();
    const activeSplit = splits.find(s => s.id === activeSplitId);

    const [selectedDayId, setSelectedDayId] = useState(activeSplit?.days[0]?.id || null);
    const [exercises, setExercises] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (activeSplit && selectedDayId) {
            const day = activeSplit.days.find(d => d.id === selectedDayId);
            if (day) {
                setExercises(day.exercises.map(ex => ({ ...ex, completed: false })));
            }
        }
    }, [activeSplit, selectedDayId]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    if (!activeSplit) {
        return (
            <div className="text-center py-20 flex flex-col items-center">
                <p className="text-gray-400 mb-6 text-xl">No active routine selected.</p>
                <Link to="/templates" className="bg-gym-blue text-white font-bold uppercase py-3 px-8 rounded-full hover:scale-105 transition-transform">
                    Find a Routine
                </Link>
            </div>
        );
    }

    const handleDragEnd = (event) => {
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
        setExercises(items => items.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex));
    };

    const handleCompleteDay = () => {
        const dayName = activeSplit.days.find(d => d.id === selectedDayId).name;
        toast.success(`${dayName} Completed!`, { icon: '🔥' });
        setExercises(items => items.map(ex => ({ ...ex, completed: true })));
        logWorkout(activeSplit.id, selectedDayId);

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
    };

    const isAllComplete = exercises.length > 0 && exercises.every(ex => ex.completed);

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8 relative">
            {showConfetti && <div className="fixed inset-0 z-50 pointer-events-none"><Confetti recycle={false} numberOfPieces={600} gravity={0.15} /></div>}

            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-wide uppercase">{activeSplit.name}</h1>
                </div>
            </header>

            {/* Horizontal Week Strip */}
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                {activeSplit.days.map((day) => {
                    const isActive = day.id === selectedDayId;
                    return (
                        <button
                            key={day.id}
                            onClick={() => setSelectedDayId(day.id)}
                            className={`snap-center shrink-0 min-w-[150px] p-4 rounded-xl border text-left transition-all ${isActive
                                    ? 'bg-gym-gray border-gym-blue shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                    : 'bg-gym-dark border-gym-light hover:border-gray-500'
                                }`}
                        >
                            <h3 className={`font-bold uppercase ${isActive ? 'text-gym-blue' : 'text-white'}`}>{day.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 font-mono">{day.exercises.length} EXERCISES</p>
                        </button>
                    )
                })}
            </div>

            {/* Exercise List */}
            <div className={`bg-gym-gray border p-6 rounded-2xl shadow-xl transition-colors duration-500 ${isAllComplete ? 'border-gym-green' : 'border-gym-light'}`}>
                <div className="flex justify-between items-center mb-6 border-b border-gym-light pb-4">
                    <h2 className="text-2xl font-bold uppercase text-white tracking-wide">{activeSplit.days.find(d => d.id === selectedDayId)?.name}</h2>
                    <button
                        onClick={handleCompleteDay}
                        disabled={exercises.length === 0}
                        className="bg-gym-blue hover:bg-blue-500 active:scale-95 text-white font-bold uppercase py-2 px-6 rounded-full transition-all disabled:opacity-50"
                    >
                        Complete Day
                    </button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={exercises} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {exercises.map(exercise => (
                                    <motion.div key={exercise.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                                        <SortableExercise exercise={exercise} onToggle={handleToggle} onOpenVideo={() => setSelectedVideo(exercise.name)} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {exercises.length === 0 && (
                                <p className="text-center text-gray-500 py-10">No exercises found for this day.</p>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            <YoutubeModal exerciseName={selectedVideo} isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
        </motion.div>
    );
}
