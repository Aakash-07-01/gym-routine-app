import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultSplits } from '../data/defaultSplits';

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
                youtubeApiKey: "AIzaSyBacvQR1h-SMjeXFxRGQjzqCcgdHlihtro",
                theme: "dark"
            },
            currentWeekStart: null,
            showNewWeekSummary: null,

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
