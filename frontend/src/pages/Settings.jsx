import { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Trash2, Moon, Save } from 'lucide-react';
import useGymStore from '../store/gymStore';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { resetData } = useGymStore();
    const { user, token, logout } = useAuthStore();
    const navigate = useNavigate();

    const [profileForm, setProfileForm] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        startingWeight: user?.startingWeight || '',
        height: user?.height || '',
        primaryGoal: user?.primaryGoal || 'Muscle Gain'
    });
    const [loading, setLoading] = useState(false);

    const handleProfileChange = (e) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileForm)
            });
            if (!res.ok) throw new Error('Failed to update profile');
            const data = await res.json();

            const updatedUser = { ...user, ...data };
            localStorage.setItem('gym_user', JSON.stringify(updatedUser));
            toast.success('Profile updated!');
            window.location.reload();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('WARNING: This will completely delete your account and all associated data permanently. Are you absolutely sure?')) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/users/profile`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to delete account');

                toast.success('Account deleted successfully.');
                resetData();
                logout();
                navigate('/register');
            } catch (err) {
                toast.error(err.message);
            }
        }
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all local split and history data?')) {
            resetData();
            toast.success('Local data cleared successfully.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Configure your FitApp preferences.</p>
            </div>

            {/* Profile Modification */}
            <div className="bg-gym-gray border border-gym-light p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                    <User className="text-gym-primary" size={24} />
                    <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                        <input type="text" name="fullName" value={profileForm.fullName} onChange={handleProfileChange} className="w-full bg-gym-dark border border-gym-light rounded-lg px-4 py-2.5 text-white outline-none focus:border-gym-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Email</label>
                        <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} className="w-full bg-gym-dark border border-gym-light rounded-lg px-4 py-2.5 text-white outline-none focus:border-gym-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1 cursor-not-allowed">Height</label>
                        <input type="number" name="height" value={profileForm.height} onChange={handleProfileChange} className="w-full bg-gym-dark border border-gym-light rounded-lg px-4 py-2.5 text-white outline-none focus:border-gym-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1 cursor-not-allowed">Starting Weight</label>
                        <input type="number" name="startingWeight" value={profileForm.startingWeight} onChange={handleProfileChange} className="w-full bg-gym-dark border border-gym-light rounded-lg px-4 py-2.5 text-white outline-none focus:border-gym-primary transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-400 text-sm mb-1">Primary Goal</label>
                        <select name="primaryGoal" value={profileForm.primaryGoal} onChange={handleProfileChange} className="w-full bg-gym-dark border border-gym-light rounded-lg px-4 py-2.5 text-white outline-none focus:border-gym-primary transition-colors appearance-none">
                            <option>Muscle Gain</option>
                            <option>Fat Loss</option>
                            <option>Maintenance</option>
                            <option>Athletic Performance</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={handleSaveProfile} disabled={loading} className="bg-gym-primary hover:scale-105 active:scale-95 transition-transform text-black font-bold uppercase py-2.5 px-6 rounded-lg flex items-center justify-center gap-2">
                        <Save size={18} /> {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-gym-gray border border-gym-light p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                    <Moon className="text-gym-blue" size={24} />
                    <h2 className="text-xl font-bold text-white">Appearance</h2>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gym-dark">
                    <span className="text-white">Dark Mode</span>
                    <span className="bg-gym-blue text-white px-3 py-1 rounded-full text-xs cursor-default">Enabled natively</span>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-gym-gray border border-red-900 border-opacity-30 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                    <Trash2 className="text-red-500" size={24} />
                    <h2 className="text-xl font-bold text-red-500">Danger Zone</h2>
                </div>
                <p className="text-sm text-gray-400 mb-6">
                    Reset local session data, or wipe your account permanently from FitOS servers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleReset}
                        className="flex-1 bg-gym-dark hover:bg-gym-border text-gray-400 border border-gray-600 font-semibold py-3 px-4 rounded-xl transition-colors"
                    >
                        Reset Local Data
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 font-semibold py-3 px-4 rounded-xl transition-colors"
                    >
                        Delete Account Permanently
                    </button>
                </div>
            </div>

        </div>
    );
}
