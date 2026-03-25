import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useGymStore from '../store/gymStore';

export default function Dashboard() {
    const user = useAuthStore(state => state.user);
    const { activeSplitId, splits, workoutLog } = useGymStore();

    const activeSplit = splits.find(s => s.id === activeSplitId) || null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const completedDaysThisWeek = workoutLog.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startOfWeek;
    }).length;

    const totalDays = activeSplit ? activeSplit.days.length : 7;
    const completedDays = Math.min(completedDaysThisWeek, totalDays);
    const todaysDay = activeSplit ? activeSplit.days[completedDays % activeSplit.days.length] : null;

    const data = [
        { name: 'Completed', value: completedDays },
        { name: 'Remaining', value: Math.max(0, totalDays - completedDays) },
    ];
    const COLORS = ['#10b981', '#2a2a2a'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 max-w-4xl mx-auto"
        >
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome back, {user?.username || 'Athlete'}</h1>
                    <p className="text-gray-400 mt-1">{"Let's crush today's goals."}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Today's Workout Card */}
                <div className="bg-gym-gray border border-gym-light p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold text-white mb-4">Today's Focus</h2>
                    {activeSplit && todaysDay ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-gym-dark rounded-lg border border-gym-light">
                                <h3 className="text-lg font-semibold text-gym-blue">{todaysDay.name}</h3>
                                <p className="text-gray-400 text-sm mt-1">{activeSplit.name}</p>
                            </div>
                            <Link
                                to="/routine"
                                className="block w-full text-center bg-gym-blue hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                Go to Routine
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-400 mb-4">No active routine found.</p>
                            <Link to="/templates" className="text-gym-blue hover:underline font-medium">
                                Browse Templates
                            </Link>
                        </div>
                    )}
                </div>

                {/* Weekly Progress Ring */}
                <div className="bg-gym-gray border border-gym-light p-6 rounded-xl shadow-sm flex flex-col items-center">
                    <h2 className="text-xl font-bold text-white w-full">Weekly Streak</h2>
                    <div className="h-48 w-full mt-4 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-white">{completedDays}/{totalDays}</span>
                            <span className="text-xs text-gray-400">Days</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
