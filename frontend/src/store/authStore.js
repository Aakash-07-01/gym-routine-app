import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: localStorage.getItem('gym_user') ? JSON.parse(localStorage.getItem('gym_user')) : null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (credentials) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            if (!response.ok) throw new Error('Invalid credentials');
            const data = await response.json();

            localStorage.setItem('token', data.token);
            // Decode simple user from token or just stash name
            const user = { username: credentials.username };
            localStorage.setItem('gym_user', JSON.stringify(user));

            set({ user, token: data.token, isAuthenticated: true });
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Registration failed');
            }
            const data = await response.json();

            localStorage.setItem('token', data.token);
            const user = { username: userData.username };
            localStorage.setItem('gym_user', JSON.stringify(user));

            set({ user, token: data.token, isAuthenticated: true });
            return { success: true };
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('gym_user');
        set({ user: null, token: null, isAuthenticated: false });
    }
}));

export default useAuthStore;
