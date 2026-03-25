import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const login = useAuthStore(state => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login({ username, password });
        if (result.success) {
            toast.success('Welcome back!');
            navigate('/');
        } else {
            toast.error(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-gym-dark flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gym-gray p-8 rounded-xl shadow-lg border border-gym-light">
                <h2 className="text-3xl font-bold text-center text-white mb-6">Login to FitApp</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Username</label>
                        <input
                            type="text"
                            className="w-full bg-gym-dark border border-gym-light rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gym-blue"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-gym-dark border border-gym-light rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gym-blue"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gym-blue hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                        Sign In
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-400">
                    Don't have an account? <Link to="/register" className="text-gym-blue hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}
