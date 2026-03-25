import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultSplits } from '../data/defaultSplits';

const useGymStore = create(
    persist(
        (set, get) => ({
            activeSplitId: null,
            splits: defaultSplits,
            workoutLog: [],
            youtubeCache: {},
            settings: {
                youtubeApiKey: "AIzaSyBacvQR1h-SMjeXFxRGQjzqCcgdHlihtro",
                theme: "dark"
            },

            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),

            // --- Split Actions ---
            setActiveSplitId: (id) => set({ activeSplitId: id }),

            createCustomSplit: (split) => set((state) => ({
                splits: [...state.splits, split]
            })),

            updateCustomSplit: (updatedSplit) => set((state) => ({
                splits: state.splits.map(s => s.id === updatedSplit.id ? updatedSplit : s)
            })),

            deleteCustomSplit: (id) => set((state) => {
                const nextSplits = state.splits.filter(s => s.id !== id);
                return {
                    splits: nextSplits,
                    activeSplitId: state.activeSplitId === id ? null : state.activeSplitId
                };
            }),

            // --- Workout Actions ---
            logWorkout: (splitId, dayId) => set((state) => {
                const todayStr = new Date().toISOString().split('T')[0];
                const newLog = {
                    date: todayStr,
                    splitId,
                    dayId,
                    completedAt: new Date().toISOString()
                };
                return { workoutLog: [...state.workoutLog, newLog] };
            }),

            // --- YouTube Cache Actions ---
            cacheYoutubeResults: (exerciseName, videos) => set((state) => ({
                youtubeCache: {
                    ...state.youtubeCache,
                    [exerciseName.toLowerCase()]: {
                        cachedAt: new Date().toISOString(),
                        videos
                    }
                }
            })),

            // --- Settings Actions ---
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            resetData: () => set({
                activeSplitId: null,
                splits: defaultSplits,
                workoutLog: [],
                youtubeCache: {},
                settings: {
                    youtubeApiKey: "AIzaSyBacvQR1h-SMjeXFxRGQjzqCcgdHlihtro",
                    theme: "dark"
                }
            })
        }),
        {
            name: 'gym-routine-storage',
            onRehydrateStorage: () => (state) => {
                if (state) state.setHasHydrated(true);
            }
        }
    )
);

export default useGymStore;
