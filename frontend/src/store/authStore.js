import { create } from 'zustand';

const getSafeUser = () => {
    try {
        const item = localStorage.getItem('gym_user');
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.warn('Failed to parse gym_user string from localStorage, clearing it.', e);
        localStorage.removeItem('gym_user');
        return null;
    }
};

const useAuthStore = create((set) => ({
    user: getSafeUser(),
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (credentials) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://gym-routine-backend.onrender.com' : 'http://localhost:8080')}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            let data;
            try {
                data = await response.json();
            } catch (e) {
                // Ignore parse error
            }

            if (!response.ok) {
                throw new Error(data?.message || 'Invalid credentials');
            }

            localStorage.setItem('token', data.token);
            // Decode simple user from token or just stash name
            const user = { username: credentials.username };
            localStorage.setItem('gym_user', JSON.stringify(user));

            set({ user, token: data.token, isAuthenticated: true });
            return { success: true };
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('Network Error: Cannot connect to backend. Ensure VITE_API_URL is configured in your Vercel deployment settings.');
            }
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://gym-routine-backend.onrender.com' : 'http://localhost:8080')}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    throw new Error('Invalid credentials');
                }
                throw new Error(errorData.message || 'Login failed');
            }
            const data = await response.json();

            // For email verification, do NOT log the user in automatically
            return { success: true, message: data.message || "Registration successful." };
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('Network Error: Cannot connect to backend. Ensure VITE_API_URL is configured in your Vercel deployment settings.');
            }
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
