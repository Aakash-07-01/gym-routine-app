package com.gymroutine.backend.service;

import com.gymroutine.backend.dto.DashboardDTO;
import com.gymroutine.backend.model.*;
import com.gymroutine.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class DashboardService {
        private final CardioLogRepository cardioRepo;
        private final BodyMetricsLogRepository metricsRepo;
        private final DailyNoteRepository noteRepo;
        private final PRRepository prRepo;
        private final WorkoutLogRepository workoutLogRepo;

        public DashboardService(CardioLogRepository cardioRepo, BodyMetricsLogRepository metricsRepo,
                        DailyNoteRepository noteRepo, PRRepository prRepo, WorkoutLogRepository workoutLogRepo) {
                this.cardioRepo = cardioRepo;
                this.metricsRepo = metricsRepo;
                this.noteRepo = noteRepo;
                this.prRepo = prRepo;
                this.workoutLogRepo = workoutLogRepo;
        }

        public DashboardDTO getDashboardData(User user) {
                DashboardDTO dto = new DashboardDTO();

                // 1. Calories Burned Today
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                double calories = cardioRepo.findAllByUserAndDateLoggedAfter(user, startOfDay)
                                .stream()
                                .filter(c -> c.getEstimatedCaloriesBurned() != null)
                                .mapToDouble(CardioLog::getEstimatedCaloriesBurned)
                                .sum();
                dto.setCaloriesBurnedToday(calories); // Will augment with lifting METs later

                // 2. Body Metrics
                metricsRepo.findFirstByUserOrderByDateLoggedDesc(user).ifPresentOrElse(m -> {
                        dto.setCurrentWeight(m.getBodyWeight());
                        dto.setCurrentBodyFat(m.getBodyFatPercentage());
                        if (m.getDateLogged() != null) {
                                long days = ChronoUnit.DAYS.between(m.getDateLogged().toLocalDate(), LocalDate.now());
                                dto.setDaysSinceLastMetricLog(days);
                        } else {
                                dto.setDaysSinceLastMetricLog(null);
                        }
                }, () -> {
                        dto.setDaysSinceLastMetricLog(null);
                });

                // 3. PRs
                dto.setActivePRs(prRepo.findAllByUser(user).size());

                // 4. AI Insight
                noteRepo.findFirstByUserOrderByDateDesc(user).ifPresent(n -> {
                        dto.setAiInsight(n.getAiInsight() != null ? n.getAiInsight()
                                        : "Log notes today to receive insights!");
                });

                // 5. Calculate actual streak
                java.util.List<WorkoutLog> logs = workoutLogRepo.findAllByUserOrderByCompletedAtDesc(user);
                int streak = 0;
                if (!logs.isEmpty()) {
                        java.util.List<LocalDate> distinctDates = logs.stream()
                                        .map(l -> l.getCompletedAt().toLocalDate())
                                        .distinct()
                                        .collect(java.util.stream.Collectors.toList());

                        LocalDate today = LocalDate.now();
                        LocalDate yesterday = today.minusDays(1);
                        LocalDate lastWorkoutDate = distinctDates.get(0);

                        if (lastWorkoutDate.equals(today) || lastWorkoutDate.equals(yesterday)) {
                                streak = 1;
                                LocalDate expectedDate = lastWorkoutDate.minusDays(1);
                                for (int i = 1; i < distinctDates.size(); i++) {
                                        LocalDate d = distinctDates.get(i);
                                        if (d.equals(expectedDate)) {
                                                streak++;
                                                expectedDate = expectedDate.minusDays(1);
                                        } else {
                                                break;
                                        }
                                }
                        }
                }
                dto.setStreak(streak);

                dto.setTodaysFocus(user.getPrimaryGoal() != null ? user.getPrimaryGoal() + " Focus" : "Rest");

                return dto;
        }

        public java.util.Map<String, Object> getWeeklySummary(User user) {
                LocalDateTime startOfWeek = LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue() % 7)
                                .atStartOfDay();
                long workoutsThisWeek = workoutLogRepo
                                .findAllByUserAndCompletedAtAfterOrderByCompletedAtDesc(user, startOfWeek)
                                .size();
                long newPRs = prRepo.findAllByUser(user).stream()
                                .filter(p -> p.getDateAchieved() != null && p.getDateAchieved().isAfter(startOfWeek))
                                .count();
                double caloriesBurned = cardioRepo.findAllByUserAndDateLoggedAfter(user, startOfWeek).stream()
                                .filter(c -> c.getEstimatedCaloriesBurned() != null)
                                .mapToDouble(CardioLog::getEstimatedCaloriesBurned)
                                .sum();
                return java.util.Map.of(
                                "workoutsThisWeek", workoutsThisWeek,
                                "newPRs", newPRs,
                                "caloriesBurned", caloriesBurned);
        }
}
