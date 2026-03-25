import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, LayoutList, History, Settings, LogOut, Dumbbell } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function MainLayout() {
    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: Home, label: 'Dashboard' },
        { to: '/routine', icon: Calendar, label: 'My Routine' },
        { to: '/templates', icon: LayoutList, label: 'Templates' },
        { to: '/history', icon: History, label: 'History' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-gym-dark flex flex-col md:flex-row">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-gym-gray border-r border-gym-light p-4">
                <div className="flex items-center gap-3 text-gym-blue font-bold text-2xl mb-8 px-2">
                    <Dumbbell size={32} />
                    <span>FitApp</span>
                </div>
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-gym-blue text-white' : 'text-gray-400 hover:bg-gym-light hover:text-white'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gym-light hover:text-red-400 transition-colors mt-auto"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0 p-4 md:p-8">
                <Outlet />
            </main>

            {/* Bottom Nav for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gym-gray border-t border-gym-light flex justify-around items-center p-3 z-50">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-gym-blue' : 'text-gray-400'
                            }`
                        }
                    >
                        <item.icon size={24} />
                        <span className="text-[10px]">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
