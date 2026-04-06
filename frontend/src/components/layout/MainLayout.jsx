import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, LayoutList, History, Settings, LogOut, Dumbbell, Shield, Trophy } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useState, useEffect } from 'react';

export default function MainLayout() {
    const logout = useAuthStore(state => state.logout);
    const user = useAuthStore(state => state.user);
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: Home, label: 'Dashboard' },
        { to: '/routine', icon: Calendar, label: 'Routine' },
        { to: '/templates', icon: LayoutList, label: 'Library' },
        { to: '/history', icon: History, label: 'History' },
        { to: '/prs', icon: Trophy, label: 'PRs' },
    ];

    if (user?.username === 'admin') {
        navItems.push({ to: '/admin', icon: Shield, label: 'Admin' });
    }

    return (
        <div className="relative min-h-screen bg-gym-dark overflow-hidden flex flex-col font-inter">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gym-blue opacity-[0.07] blur-[140px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gym-accent opacity-[0.03] blur-[120px] pointer-events-none"></div>

            {/* Top Menu Bar (OS Style) */}
            <header className="glass-panel mx-4 mt-4 px-6 py-3 flex items-center justify-between z-40 shadow-xl border border-white/5 relative bg-[#0b0b0b]/60">
                <div className="flex items-center gap-6">
                    <div className="flex gap-2.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-gym-red shadow-[0_0_10px_rgba(255,59,48,0.4)] border border-white/10"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.4)] border border-white/10"></div>
                        <div className="w-3.5 h-3.5 rounded-full bg-gym-green shadow-[0_0_10px_rgba(52,199,89,0.4)] border border-white/10"></div>
                    </div>
                    <div className="flex items-center gap-3 text-white font-bold tracking-tight">
                        <Dumbbell size={20} className="text-gym-blue" />
                        <span className="text-lg">{user?.fullName || user?.username ? `${user?.fullName || user?.username}'s Personal Trainer` : 'FitOS'}</span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    <span className="text-sm text-gray-300 font-mono tracking-widest bg-white/5 px-4 py-1 rounded-full border border-white/10 shadow-inner">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                        <button onClick={() => navigate('/settings')} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                            <Settings size={18} />
                        </button>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-gym-red transition-colors p-2 hover:bg-white/10 rounded-full">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Application Window */}
            <main className="flex-1 overflow-visible relative z-30 p-4 md:p-6 lg:p-8 flex justify-center items-start pt-6 h-full pb-32">
                <div className="w-full max-w-7xl glass-panel h-[calc(100vh-180px)] flex flex-col overflow-hidden relative shadow-2xl border border-white/10 bg-[#121212]/80">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                        <Outlet />
                    </div>
                </div>
            </main>

            {/* Floating Bottom Dock */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-2 max-w-[calc(100vw-16px)]">
                <nav className="glass-panel px-2 py-2 flex items-center justify-center gap-1 md:gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 rounded-2xl bg-[#080808]/80 overflow-x-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `relative group flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-xl transition-all duration-300 ease-out flex-shrink-0 ${isActive ? 'bg-white/10 text-white transform -translate-y-2 md:-translate-y-3 shadow-[0_10px_20px_rgba(0,122,255,0.2)] border border-white/10 outline outline-1 outline-gym-blue/30' : 'text-gray-400 hover:text-white hover:bg-white/5 hover:-translate-y-2'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={22} className={`transition-all duration-300 ${isActive ? 'text-gym-blue drop-shadow-[0_0_8px_rgba(0,122,255,0.8)]' : ''}`} />
                                    {/* App Label Tooltip */}
                                    <span className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-[#1a1a1a]/95 text-white text-xs px-3 py-1.5 rounded-md shadow-xl border border-white/10 whitespace-nowrap font-medium tracking-wide">
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* Mobile Only: Logout & Settings in Dock */}
                    <div className="md:hidden w-px h-8 bg-white/10 mx-0.5"></div>
                    <button
                        onClick={() => navigate('/settings')}
                        className="md:hidden relative group p-2 sm:p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 hover:-translate-y-2 flex-shrink-0"
                    >
                        <Settings size={22} />
                        <span className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-[#1a1a1a]/95 text-white text-xs px-3 py-1.5 rounded-md shadow-xl border border-white/10">Settings</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="md:hidden relative group p-2 sm:p-3 text-gray-400 hover:text-gym-red hover:bg-white/5 rounded-xl transition-all duration-300 hover:-translate-y-2 flex-shrink-0"
                    >
                        <LogOut size={22} />
                        <span className="absolute -top-12 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-[#1a1a1a]/95 text-gym-red text-xs px-3 py-1.5 rounded-md shadow-xl border border-gym-red/30">Logout</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}
