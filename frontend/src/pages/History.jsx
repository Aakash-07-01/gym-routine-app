import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useGymStore from '../store/gymStore';
import ActivityCalendar from 'react-activity-calendar';
import { motion } from 'framer-motion';

export default function History() {
    const user = useAuthStore(state => state.user);
    const { workoutLog, splits } = useGymStore();

    // Generate Calendar Data for the last 365 days
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    startDate.setHours(0, 0, 0, 0);

    const logCounts = {};
    workoutLog.forEach(log => {
        if (!log.completedAt && !log.date) return;
        const d = new Date(log.completedAt || log.date).toISOString().split('T')[0];
        logCounts[d] = (logCounts[d] || 0) + 1;
    });

    const calendarData = [];
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const count = logCounts[dateStr] || 0;
        let level = 0;
        if (count === 1) level = 1;
        else if (count === 2) level = 2;
        else if (count === 3) level = 3;
        else if (count >= 4) level = 4;

        calendarData.push({
            date: dateStr,
            count: count,
            level: level
        });
    }

    const customTheme = {
        light: ['#1A1A1A', '#394A00', '#638000', '#91BB00', '#C8FF00'],
        dark: ['#1A1A1A', '#394A00', '#638000', '#91BB00', '#C8FF00'],
    };

    const logs = [...workoutLog]
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .map(log => {
            const split = splits.find(s => s.id === log.splitId);
            const day = split ? split.days.find(d => d.id === log.dayId) : null;
            return {
                id: log.completedAt,
                dayName: day ? day.name : 'Unknown Day',
                splitName: split ? split.name : 'Unknown Split',
                completedAt: log.completedAt
            };
        });

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto space-y-10 pb-20">
            <div>
                <h1 className="text-4xl font-bebas text-white tracking-wide mb-1">Workout History</h1>
                <p className="text-gray-400">Review your past performance and consistency.</p>
            </div>

            {/* Consistency Heatmap */}
            <div className="bg-gym-surfaceElevated border border-gym-border p-6 sm:p-8 rounded-2xl shadow-xl overflow-x-auto custom-scrollbar">
                <h2 className="text-2xl font-bebas text-white tracking-wide mb-6">Consistency Heatmap</h2>
                <div className="min-w-[800px] flex justify-center">
                    <ActivityCalendar
                        data={calendarData}
                        theme={customTheme}
                        labels={{
                            legend: { less: 'Less', more: 'Crushing it' },
                            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        }}
                        colorScheme="dark"
                        blockSize={14}
                        blockRadius={4}
                        blockMargin={4}
                        fontSize={14}
                    />
                </div>
            </div>

            {/* Workout Logs List */}
            <div className="bg-gym-surfaceElevated border border-gym-border rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gym-border bg-gym-surface/50">
                    <h2 className="text-2xl font-bebas text-white tracking-wide">Recent Logs</h2>
                </div>
                {logs.length > 0 ? (
                    <div className="divide-y divide-gym-border relative">
                        {logs.map((log) => (
                            <div key={log.id} className="p-4 sm:p-6 hover:bg-gym-surface transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold uppercase text-white">{log.dayName}</h3>
                                    <p className="text-gym-primary font-mono text-sm mt-1">{log.splitName}</p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-gym-surface border border-gym-border px-4 py-2 rounded-full text-sm font-bold text-gray-300 flex items-center justify-end sm:justify-start w-fit ml-auto sm:ml-0 gap-3">
                                        <span className="w-2 h-2 rounded-full bg-gym-success shadow-[0_0_8px_rgba(0,230,118,0.8)]"></span>
                                        {new Date(log.completedAt).toLocaleDateString(undefined, {
                                            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center">
                        <span className="text-6xl mb-4">💤</span>
                        <p className="text-gray-400 text-lg">No workouts logged yet. Go crush a workout!</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
