import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useGymStore from '../store/gymStore';

export default function History() {
    const user = useAuthStore(state => state.user);
    const { workoutLog, splits } = useGymStore();

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
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white mb-2">Workout History</h1>
            <p className="text-gray-400 mb-8">Review your past performance and consistency.</p>

            <div className="bg-gym-gray border border-gym-light rounded-xl overflow-hidden">
                {logs.length > 0 ? (
                    <div className="divide-y divide-gym-light">
                        {logs.map((log) => (
                            <div key={log.id} className="p-4 sm:p-6 hover:bg-gym-dark transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{log.dayName}</h3>
                                    <p className="text-gym-blue text-sm">{log.splitName}</p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-gym-dark border border-gym-light px-3 py-1 rounded-full text-sm text-gray-400 flex items-center justify-end sm:justify-start w-fit ml-auto sm:ml-0 gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gym-green"></span>
                                        {new Date(log.completedAt).toLocaleDateString(undefined, {
                                            weekday: 'short', month: 'short', day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No workouts logged yet. Go crush a workout!
                    </div>
                )}
            </div>
        </div>
    );
}
