import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { ShieldAlert, Users, Fingerprint, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = useAuthStore(state => state.token);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 403) {
                    setError('Access Denied. You do not have administrator privileges.');
                    setLoading(false);
                    return;
                }
                if (!response.ok) throw new Error('Failed to fetch users');

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchUsers();
    }, [token]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gym-blue"></div></div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gym-red gap-4">
                <ShieldAlert size={64} className="text-gym-red drop-shadow-[0_0_15px_rgba(255,59,48,0.5)]" />
                <h2 className="text-2xl font-bold tracking-tight">{error}</h2>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header className="glass-panel p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0B0B0B]/80 to-transparent"></div>
                <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            <ShieldAlert className="text-gym-blue" size={36} /> Admin Command Center
                        </h1>
                        <p className="text-gray-400 font-mono tracking-wider text-sm mt-2">Elevated privileges granted. Authorized personnel only.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 flex flex-col glass-panel-hover">
                    <div className="flex items-center gap-3 mb-4 text-gray-400 font-mono tracking-widest text-xs uppercase">
                        <Users size={16} /> Total Users
                    </div>
                    <p className="text-4xl font-bold text-white">{users.length}</p>
                </div>
                <div className="glass-panel p-6 flex flex-col glass-panel-hover">
                    <div className="flex items-center gap-3 mb-4 text-gray-400 font-mono tracking-widest text-xs uppercase">
                        <Fingerprint size={16} /> Active Admins
                    </div>
                    <p className="text-4xl font-bold text-gym-blue">{users.filter(u => u.role === 'ROLE_ADMIN').length}</p>
                </div>
                <div className="glass-panel p-6 flex flex-col glass-panel-hover">
                    <div className="flex items-center gap-3 mb-4 text-gray-400 font-mono tracking-widest text-xs uppercase">
                        <Activity size={16} /> System Status
                    </div>
                    <p className="text-xl font-bold text-gym-green uppercase flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gym-green shadow-[0_0_8px_rgba(52,199,89,0.8)]"></span> Online</p>
                </div>
            </div>

            <div className="glass-panel overflow-hidden relative border border-white/10 p-0">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-gray-300 min-w-max">
                        <thead className="bg-black/40 text-gray-400 uppercase text-xs font-mono tracking-widest border-b border-white/10">
                            <tr>
                                <th className="px-6 py-5">ID</th>
                                <th className="px-6 py-5">Username</th>
                                <th className="px-6 py-5">Email</th>
                                <th className="px-6 py-5">Full Name</th>
                                <th className="px-6 py-5">Role</th>
                                <th className="px-6 py-5">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-[#0a0a0a]/50">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors duration-200">
                                    <td className="px-6 py-4 font-mono text-xs">{user.id}</td>
                                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${user.role === 'ROLE_ADMIN' ? 'bg-gym-accent shadow-[0_0_5px_rgba(200,255,0,0.5)]' : 'bg-gray-500'}`}></div>
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4 text-gray-400">{user.fullName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${user.role === 'ROLE_ADMIN' ? 'bg-gym-blue/10 text-gym-blue border-gym-blue/30' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-mono tracking-widest uppercase text-sm">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
