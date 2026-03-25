import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: localStorage.getItem('gym_user') ? JSON.parse(localStorage.getItem('gym_user')) : null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (credentials) => {
        // Frontend-only mock for Vercel
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = { username: credentials.username || 'Athlete' };
                const token = 'mock-jwt-' + Date.now();
                localStorage.setItem('token', token);
                localStorage.setItem('gym_user', JSON.stringify(user));
                set({ user, token, isAuthenticated: true });
                resolve({ success: true });
            }, 600);
        });
    },

    register: async (userData) => {
        // Frontend-only mock for Vercel
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = { username: userData.username || 'Athlete' };
                const token = 'mock-jwt-' + Date.now();
                localStorage.setItem('token', token);
                localStorage.setItem('gym_user', JSON.stringify(user));
                set({ user, token, isAuthenticated: true });
                resolve({ success: true });
            }, 600);
        });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('gym_user');
        set({ user: null, token: null, isAuthenticated: false });
    }
}));

export default useAuthStore;
