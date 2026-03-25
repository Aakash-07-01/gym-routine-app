import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGymStore from '../store/gymStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Trash2, GripVertical, Save, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const generateId = () => Math.random().toString(36).substring(2, 9);

function SortableExerciseRow({ exercise, dayId, updateExercise, removeExercise }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exercise.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-3 sm:gap-4 items-center bg-gym-surface p-3 rounded-lg border border-gym-border group transition-all hover:border-gym-light">
            <div {...attributes} {...listeners} className="text-gray-500 hover:text-white cursor-grab shrink-0">
                <GripVertical size={20} />
            </div>
            <input
                type="text" value={exercise.name} onChange={(e) => updateExercise(dayId, exercise.id, 'name', e.target.value)}
                className="flex-1 bg-transparent border-b border-transparent focus:border-gym-primary text-white outline-none py-1 min-w-[100px] text-sm sm:text-base transition-colors" placeholder="Exercise Name"
            />
            <input
                type="number" value={exercise.sets} onChange={(e) => updateExercise(dayId, exercise.id, 'sets', e.target.value)}
                className="w-12 sm:w-16 bg-gym-dark border border-gym-border focus:border-gym-primary text-white text-center rounded py-1 outline-none font-mono text-sm transition-colors" placeholder="Sets"
            />
            <span className="text-gray-500 font-mono text-sm leading-none shrink-0">×</span>
            <input
                type="text" value={exercise.reps} onChange={(e) => updateExercise(dayId, exercise.id, 'reps', e.target.value)}
                className="w-16 sm:w-20 bg-gym-dark border border-gym-border focus:border-gym-primary text-white text-center rounded py-1 outline-none font-mono text-sm transition-colors" placeholder="Reps"
            />
            <button onClick={() => removeExercise(dayId, exercise.id)} className="text-gray-500 hover:text-gym-accent transition-colors p-2 shrink-0">
                <Trash2 size={18} />
            </button>
        </div>
    );
}

export default function CustomSplitBuilder() {
    const { sourceId } = useParams();
    const navigate = useNavigate();
    const { splits, createCustomSplit, updateCustomSplit } = useGymStore();

    const [splitId, setSplitId] = useState(() => generateId());
    const [splitName, setSplitName] = useState('New Custom Split');
    const [days, setDays] = useState([{ id: generateId(), name: 'Day 1', exercises: [] }]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (sourceId) {
            const sourceInfo = splits.find(s => s.id === sourceId);
            if (sourceInfo) {
                if (sourceInfo.isDefault) {
                    setSplitName(`${sourceInfo.name} (Copy)`);
                    setDays(sourceInfo.days.map(d => ({ ...d, id: generateId(), exercises: d.exercises.map(ex => ({ ...ex, id: generateId() })) })));
                } else {
                    setIsEditing(true);
                    setSplitId(sourceInfo.id);
                    setSplitName(sourceInfo.name);
                    setDays(sourceInfo.days);
                }
            }
        }
    }, [sourceId, splits]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    const handleAddDay = () => setDays([...days, { id: generateId(), name: `Day ${days.length + 1}`, exercises: [] }]);
    const handleRemoveDay = (dayId) => setDays(days.filter(d => d.id !== dayId));
    const updateDayName = (dayId, newName) => setDays(days.map(d => d.id === dayId ? { ...d, name: newName } : d));

    const moveDay = (index, direction) => {
        const newDays = [...days];
        const targetIndex = index + direction;
        const temp = newDays[index];
        newDays[index] = newDays[targetIndex];
        newDays[targetIndex] = temp;
        setDays(newDays);
    };

    const addExercise = (dayId) => {
        const newEx = { id: generateId(), name: '', sets: 3, reps: '10', weight: null, restSeconds: 90, notes: "", completed: false };
        setDays(days.map(d => d.id === dayId ? { ...d, exercises: [...d.exercises, newEx] } : d));
    };

    const updateExercise = (dayId, exId, field, value) => {
        setDays(days.map(d => d.id === dayId ? {
            ...d, exercises: d.exercises.map(ex => ex.id === exId ? { ...ex, [field]: value } : ex)
        } : d));
    };

    const removeExercise = (dayId, exId) => {
        setDays(days.map(d => d.id === dayId ? {
            ...d, exercises: d.exercises.filter(ex => ex.id !== exId)
        } : d));
    };

    const handleDragEnd = (event, dayId) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setDays(days.map(d => {
                if (d.id === dayId) {
                    const oldIdx = d.exercises.findIndex(ex => ex.id === active.id);
                    const newIdx = d.exercises.findIndex(ex => ex.id === over.id);
                    return { ...d, exercises: arrayMove(d.exercises, oldIdx, newIdx) };
                }
                return d;
            }));
        }
    };

    const handleSave = () => {
        if (!splitName.trim()) return toast.error('Split needs a name!', { icon: '⚠️' });
        if (days.length === 0) return toast.error('Split must have at least one day!', { icon: '⚠️' });

        const payload = { id: splitId, name: splitName.trim(), isDefault: false, days };
        if (isEditing) {
            updateCustomSplit(payload);
            toast.success('Split updated successfully!', { icon: '💾' });
        } else {
            createCustomSplit(payload);
            toast.success('Custom Split saved!', { icon: '💾' });
        }
        navigate('/templates');
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/templates')} className="p-2 bg-gym-surface hover:bg-gym-light rounded-full text-white transition-colors shrink-0">
                        <ArrowLeft size={24} />
                    </button>
                    <input
                        type="text"
                        value={splitName}
                        onChange={(e) => setSplitName(e.target.value)}
                        className="text-3xl sm:text-4xl font-bebas text-gym-primary tracking-wide bg-transparent border-b border-transparent focus:border-gym-primary outline-none py-1 w-full"
                        placeholder="Split Name"
                    />
                </div>
                <button onClick={handleSave} className="bg-gym-primary hover:scale-105 active:scale-95 transition-transform text-black font-bold uppercase py-3 px-8 rounded-full flex items-center justify-center gap-2 shrink-0">
                    <Save size={20} /> Save Split
                </button>
            </header>

            <div className="space-y-6">
                {days.map((day, index) => (
                    <div key={day.id} className="bg-gym-surfaceElevated border border-gym-border p-4 sm:p-6 rounded-2xl shadow-xl transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gym-border pb-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="flex flex-col gap-1 items-center shrink-0">
                                    <button disabled={index === 0} onClick={() => moveDay(index, -1)} className="text-gray-500 hover:text-white disabled:opacity-0 transition-colors"><ArrowUp size={16} /></button>
                                    <span className="font-mono text-gym-gray bg-white rounded flex items-center justify-center font-bold w-6 h-6 text-sm">{index + 1}</span>
                                    <button disabled={index === days.length - 1} onClick={() => moveDay(index, 1)} className="text-gray-500 hover:text-white disabled:opacity-0 transition-colors"><ArrowDown size={16} /></button>
                                </div>
                                <input
                                    type="text"
                                    value={day.name}
                                    onChange={(e) => updateDayName(day.id, e.target.value)}
                                    className="text-xl sm:text-2xl font-bold uppercase text-white bg-transparent border-b border-transparent focus:border-gym-primary outline-none w-full transition-colors"
                                    placeholder={`Day ${index + 1} Name`}
                                />
                            </div>
                            <button onClick={() => handleRemoveDay(day.id)} className="text-gray-400 hover:text-gym-accent flex items-center gap-1 text-sm font-bold uppercase transition-colors shrink-0">
                                <Trash2 size={16} /> Delete Day
                            </button>
                        </div>

                        <div className="space-y-3">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, day.id)}>
                                <SortableContext items={day.exercises} strategy={verticalListSortingStrategy}>
                                    {day.exercises.map(ex => (
                                        <SortableExerciseRow key={ex.id} exercise={ex} dayId={day.id} updateExercise={updateExercise} removeExercise={removeExercise} />
                                    ))}
                                </SortableContext>
                            </DndContext>

                            <button onClick={() => addExercise(day.id)} className="w-full py-3 border-2 border-dashed border-gym-border hover:border-gym-primary hover:text-gym-primary text-gray-500 rounded-xl flex items-center justify-center gap-2 font-bold uppercase transition-colors mt-4">
                                <Plus size={20} /> Add Exercise
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={handleAddDay} className="w-full py-6 border-2 border-dashed border-gym-border hover:border-gym-primary hover:bg-gym-surface text-gray-500 hover:text-gym-primary rounded-2xl flex items-center justify-center gap-3 text-xl font-bold uppercase tracking-wide transition-all">
                <Plus size={28} /> Add New Day
            </button>
        </motion.div>
    );
}
