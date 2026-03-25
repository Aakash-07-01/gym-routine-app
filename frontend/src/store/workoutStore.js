import { create } from 'zustand';
import api from '../api/axios';

const useWorkoutStore = create((set) => ({
    activeWorkoutDay: null,
    activeExercises: [],
    isLoading: false,
    error: null,

    fetchWorkoutDay: async (splitId, dayId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/splits/${splitId}/days/${dayId}`);
            set({
                activeWorkoutDay: response.data,
                activeExercises: response.data.exercises || [],
                isLoading: false
            });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    toggleExerciseComplete: async (exerciseId) => {
        try {
            await api.patch(`/exercises/${exerciseId}/complete`);
            set((state) => ({
                activeExercises: state.activeExercises.map(ex =>
                    ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
                )
            }));
        } catch (error) {
            console.error('Failed to toggle exercise', error);
        }
    },

    completeDay: async (splitId, dayId) => {
        try {
            await api.post('/logs', { splitId, dayId, completedAt: new Date().toISOString() });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}));

export default useWorkoutStore;
