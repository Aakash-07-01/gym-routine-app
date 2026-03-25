import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    }
}));

export default useAuthStore;
