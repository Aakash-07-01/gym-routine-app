import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VolumeTrendChart({ data }) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        // Group by date and sum (weight * reps)
        const volumeByDate = data.reduce((acc, row) => {
            const date = row['Date'] ? row['Date'].split(' ')[0] : 'Unknown';
            const weight = parseFloat(row['Weight']) || 0;
            const reps = parseInt(row['Reps'], 10) || 0;
            const volume = weight * reps;

            if (!acc[date]) acc[date] = 0;
            acc[date] += volume;
            return acc;
        }, {});

        // Convert to array and sort by date
        return Object.entries(volumeByDate)
            .map(([date, volume]) => ({ date, volume }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [data]);

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500 font-mono text-sm uppercase tracking-widest border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                No volume data available
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 h-80 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6">Volume Trend</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} tickMargin={10} minTickGap={30} />
                        <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                            itemStyle={{ color: '#007AFF', fontWeight: 'bold' }}
                            formatter={(value) => [`${value} kg`, 'Total Volume']}
                            labelStyle={{ color: '#fff', marginBottom: '8px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="volume" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
