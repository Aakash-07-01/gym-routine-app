import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Scale, Camera } from 'lucide-react';
import useGymStore from '../store/gymStore';

export default function History() {
    const { workoutLog, activeSplitId, splits, logWorkout } = useGymStore();
    const [currentMonth, setCurrentMonth] = useState(() => {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [selectedDateObj, setSelectedDateObj] = useState(null);

    const activeSplit = splits.find(s => s.id === activeSplitId);

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

        const logs = workoutLog.filter(l => l.date === dateStr);
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
        useGymStore.setState(state => ({
            workoutLog: [...state.workoutLog, { date: dateStr, splitId: activeSplit?.id, dayId: 'rest', completedAt: new Date().toISOString() }]
        }));
        setSelectedDateObj(null);
    };

    const renderSheetContent = () => {
        if (!selectedDateObj) return null;
        const d = selectedDateObj.date;
        const status = getDayStatus(d);
        const scheduledDayId = activeSplit?.schedule?.[d.getDay()];
        const scheduledDay = activeSplit?.days?.find(day => day.id === scheduledDayId);
        const dateStr = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
        const log = workoutLog.find(l => l.date === d.toISOString().split('T')[0]);

        if (status === 'past-completed' || status === 'today-completed') {
            const completedDayName = activeSplit?.days?.find(day => day.id === log?.dayId)?.name || 'Workout';
            return (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bebas text-white tracking-wide">{activeSplit?.name} — {completedDayName}</h2>
                        <p className="text-gray-400">{dateStr}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gym-surface p-4 rounded-xl border border-gym-border">
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Volume</p>
                            <p className="text-2xl font-mono text-gym-primary">14,200 <span className="text-sm">kg</span></p>
                        </div>
                        <div className="bg-gym-surface p-4 rounded-xl border border-gym-border">
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Duration</p>
                            <p className="text-2xl font-mono text-gym-primary">1h 12m</p>
                        </div>
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
