import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#007AFF', '#FF3B30', '#34C759', '#FF9500', '#AF52DE', '#5AC8FA', '#FF2D55'];

export default function WorkoutDistributionChart({ data }) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const distribution = data.reduce((acc, row) => {
            const workoutName = row['Workout Name'] || 'Unknown';
            // Only count once per date+workout
            const date = row['Date'] ? row['Date'].split(' ')[0] : 'Unknown';
            const key = `${date}-${workoutName}`;
            
            if (!acc.tracker) acc.tracker = new Set();
            
            if (!acc.tracker.has(key)) {
                acc.tracker.add(key);
                if (!acc.counts[workoutName]) acc.counts[workoutName] = 0;
                acc.counts[workoutName]++;
            }
            return acc;
        }, { tracker: new Set(), counts: {} });

        return Object.entries(distribution.counts)
            .map(([name, count]) => ({ name, value: count }))
            .sort((a, b) => b.value - a.value); // Sort descending
    }, [data]);

    if (chartData.length === 0) {
        return null;
    }

    return (
        <div className="glass-panel p-6 h-80 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Workout Distribution</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            formatter={(value) => [`${value} sessions`, 'Frequency']}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#999' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
