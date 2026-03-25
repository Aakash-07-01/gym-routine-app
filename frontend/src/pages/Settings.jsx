import { useState } from 'react';
import toast from 'react-hot-toast';
import { MonitorPlay, Trash2, Moon } from 'lucide-react';
import useGymStore from '../store/gymStore';

export default function Settings() {
    const { settings, updateSettings, resetData } = useGymStore();
    const [apiKey, setApiKey] = useState(settings.youtubeApiKey);

    const saveApiKey = () => {
        updateSettings({ youtubeApiKey: apiKey });
        toast.success('API Key saved successfully!');
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all split and history data?')) {
            resetData();
            toast.success('Data cleared successfully.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Configure your FitApp preferences.</p>
            </div>

            {/* YouTube Setting */}
            <div className="bg-gym-gray border border-gym-light p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                    <MonitorPlay className="text-red-500" size={24} />
                    <h2 className="text-xl font-bold text-white">YouTube Integration</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    Provide your internal YouTube Data API v3 key to embed video tutorials directly in the app.
                </p>
                <div className="flex gap-2">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIza... API Key"
                        className="flex-1 bg-gym-dark border border-gym-light rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gym-blue"
                    />
                    <button
                        onClick={saveApiKey}
                        className="bg-gym-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Save
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
                <p className="text-sm text-gray-400 mb-4">
                    Reset all your local data, splits, and clear your session.
                </p>
                <button
                    onClick={handleReset}
                    className="bg-red-900 bg-opacity-20 hover:bg-opacity-40 text-red-500 border border-red-900 border-opacity-50 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Reset All Data
                </button>
            </div>

        </div>
    );
}
