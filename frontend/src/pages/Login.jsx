import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await login({ username, password });
            if (result.success) {
                toast.success('System Connected. Welcome back.', { icon: '⚡' });
                navigate('/');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error(error.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="max-w-md w-full relative">

                <h1 className="text-6xl font-bebas text-center text-[#C8FF00] tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(200,255,0,0.4)]">
                    SYS-LOGIN
                </h1>
                <p className="text-gray-400 font-mono text-center mb-10 text-sm tracking-widest uppercase">
                    Authentication Required.
                </p>

                <div className="card-3d p-8 relative overflow-hidden bg-[#111]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    required
                                    className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#C8FF00] font-mono transition-colors text-lg"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    required
                                    className="w-full bg-[#1a1a1a] border-2 border-[#333] rounded-xl px-4 py-4 text-white focus:outline-none focus:border-[#C8FF00] font-mono transition-colors text-lg"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t-2 border-[#222]">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#C8FF00] hover:bg-[#a6d100] text-black font-bebas text-3xl tracking-widest py-4 rounded-xl transition-transform hover:scale-[1.02] disabled:opacity-50 shadow-[0_0_15px_rgba(200,255,0,0.3)] shadow-[#C8FF00]"
                            >
                                {isLoading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t-2 border-[#222]">
                        <p className="text-gray-500 font-mono text-sm tracking-wide">
                            Unregistered? <Link to="/register" className="text-[#00e5ff] hover:text-white transition-colors uppercase">Initiate Setup</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
