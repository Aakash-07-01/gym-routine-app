import { create } from 'zustand';
import api from '../api/axios';

const useSplitStore = create((set, get) => ({
    splits: [],
    templates: [],
    activeSplit: null,
    isLoading: false,
    error: null,

    fetchSplits: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/splits');
            set({ splits: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchTemplates: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/splits/templates');
            set({ templates: response.data, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    setActiveSplit: (splitId) => {
        const split = get().splits.find(s => s.id === splitId) || get().templates.find(s => s.id === splitId);
        set({ activeSplit: split });
    }
}));

export default useSplitStore;
