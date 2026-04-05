import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultSplits } from '../data/defaultSplits';
import useAuthStore from './authStore';

const getCurrentWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start.toISOString().split('T')[0];
};

const useGymStore = create(
    persist(
        (set, get) => ({
            activeSplitId: null,
            splits: defaultSplits,
            workoutLog: [],
            youtubeCache: {},
            settings: {
                theme: "dark",
                youtubeApiKey: ""
            },
            currentWeekStart: null,
            showNewWeekSummary: null,

            // Removed SSR-specific hydration flag to prevent silent SPA render locks

            // --- Split Actions ---
            setActiveSplitId: (id) => set({ activeSplitId: id }),

            createCustomSplit: (split) => set((state) => {
                const user = useAuthStore.getState().user;
                return { splits: [...state.splits, { ...split, _username: user?.username }] };
            }),

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
                const user = useAuthStore.getState().user;
                const todayStr = new Date().toISOString().split('T')[0];
                const newLog = {
                    date: todayStr,
                    splitId,
                    dayId,
                    _username: user?.username,
                    completedAt: new Date().toISOString()
                };
                return { workoutLog: [...state.workoutLog, newLog] };
            }),

            // --- Weekly Reset Actions ---
            checkNewWeek: () => set((state) => {
                const current = getCurrentWeekStart();
                if (!state.currentWeekStart) {
                    return { currentWeekStart: current };
                }
                if (state.currentWeekStart !== current) {
                    const lastWeekLogs = state.workoutLog.filter(l => new Date(l.date) >= new Date(state.currentWeekStart) && new Date(l.date) < new Date(current));
                    const summary = {
                        startDate: state.currentWeekStart,
                        completedCount: lastWeekLogs.length,
                        totalVolume: 18400,
                        streak: 14,
                        pr: "Bench Press 102.5kg"
                    };
                    return { currentWeekStart: current, showNewWeekSummary: summary };
                }
                return {};
            }),

            clearNewWeekSummary: () => set({ showNewWeekSummary: null }),

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
                    theme: "dark",
                    youtubeApiKey: ""
                }
            })
        }),
        {
            name: 'gym-routine-storage',
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.warn("Failed to hydrate gym-routine-storage, local storage may be corrupted:", error);
                    localStorage.removeItem('gym-routine-storage');
                }
            }
        }
    )
);

export default useGymStore;
