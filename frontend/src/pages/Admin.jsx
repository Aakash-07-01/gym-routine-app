import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { ShieldAlert } from 'lucide-react';
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
            <div className="flex flex-col items-center justify-center h-full text-red-500 gap-4">
                <ShieldAlert size={64} className="text-red-500" />
                <h2 className="text-2xl font-bold">{error}</h2>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
            <div className="bg-gym-gray rounded-xl overflow-hidden shadow-lg border border-gym-light overflow-x-auto">
                <table className="w-full text-left text-gray-300 min-w-max">
                    <thead className="bg-gym-dark text-gym-blue uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 border-b border-gym-light">ID</th>
                            <th className="px-6 py-4 border-b border-gym-light">Username</th>
                            <th className="px-6 py-4 border-b border-gym-light">Email</th>
                            <th className="px-6 py-4 border-b border-gym-light">Full Name</th>
                            <th className="px-6 py-4 border-b border-gym-light">Role</th>
                            <th className="px-6 py-4 border-b border-gym-light">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-gym-light hover:bg-[#2a2a2a] transition-colors">
                                <td className="px-6 py-4">{user.id}</td>
                                <td className="px-6 py-4 font-semibold text-white">{user.username}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.fullName}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ROLE_ADMIN' ? 'bg-gym-blue text-white' : 'bg-gray-700'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
