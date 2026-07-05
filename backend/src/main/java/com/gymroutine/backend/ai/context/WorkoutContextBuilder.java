package com.gymroutine.backend.ai.context;

import com.gymroutine.backend.ai.agent.AiAgentContext;
import com.gymroutine.backend.model.*;
import com.gymroutine.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkoutContextBuilder {

    private final WorkoutLogRepository workoutLogRepo;
    private final ExerciseSessionRepository sessionRepo;
    private final PRRepository prRepo;
    private final BodyMetricsLogRepository metricsRepo;
    private final UserRepository userRepo;

    public WorkoutContextBuilder(WorkoutLogRepository workoutLogRepo,
                                 ExerciseSessionRepository sessionRepo,
                                 PRRepository prRepo,
                                 BodyMetricsLogRepository metricsRepo,
                                 UserRepository userRepo) {
        this.workoutLogRepo = workoutLogRepo;
        this.sessionRepo = sessionRepo;
        this.prRepo = prRepo;
        this.metricsRepo = metricsRepo;
        this.userRepo = userRepo;
    }

    public AiAgentContext buildWeeklyContext(Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        
        List<WorkoutLog> logs = workoutLogRepo.findAllByUserAndCompletedAtAfterOrderByCompletedAtDesc(user, sevenDaysAgo);
        
        double totalVolume = 0;
        StringBuilder contextText = new StringBuilder();
        contextText.append(String.format("USER: %s | Week: %d\n", user.getFullName(), 
                java.time.LocalDate.now().get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear())));
        
        contextText.append(String.format("SESSIONS THIS WEEK (%d sessions):\n", logs.size()));
        
        for (WorkoutLog log : logs) {
            contextText.append(String.format("  %s — (%s)\n", 
                log.getDayName(), log.getCompletedAt().format(DateTimeFormatter.ofPattern("EEE MMM dd"))));
            
            List<ExerciseSession> sessions = sessionRepo.findAllByWorkoutLog(log);
            for (ExerciseSession session : sessions) {
                contextText.append(String.format("    - %s: %dx%d @ %.1fkg\n", 
                    session.getExerciseName(), session.getSetsCompleted(), session.getRepsPerSet(), session.getWeightUsed()));
                
                if (session.getSetsCompleted() != null && session.getRepsPerSet() != null && session.getWeightUsed() != null) {
                    totalVolume += session.getSetsCompleted() * session.getRepsPerSet() * session.getWeightUsed();
                }
            }
        }

        List<PR> prs = prRepo.findAllByUser(user).stream().limit(5).collect(Collectors.toList());
        contextText.append("CURRENT PRs (top 5):\n");
        for (PR pr : prs) {
            contextText.append(String.format("  - %s: %.1fkg x%d reps\n", 
                pr.getExerciseName(), pr.getMaxWeight(), pr.getMaxRepsAtWeight()));
        }

        metricsRepo.findFirstByUserOrderByDateLoggedDesc(user)
            .ifPresent(metric -> {
                contextText.append("Current Body Weight: ").append(metric.getBodyWeight() != null ? metric.getBodyWeight() : "N/A").append(" kg\n");
                contextText.append("Current Body Fat: ").append(metric.getBodyFatPercentage() != null ? metric.getBodyFatPercentage() : "N/A").append("%\n");
            });

        contextText.append(String.format("WEEK SUMMARY: %d sessions, %.1fkg total volume\n", logs.size(), totalVolume));

        return AiAgentContext.builder()
                .userId(userId)
                .userDisplayName(user.getFullName())
                .contextText(contextText.toString())
                .weeklySessionCount(logs.size())
                .totalVolumeKg(totalVolume)
                .recentPrSummaries(prs.stream().map(pr -> pr.getExerciseName() + ": " + pr.getMaxWeight() + "kg").collect(Collectors.toList()))
                .build();
    }

    public AiAgentContext buildSessionContext(Long sessionId, Long userId) {
        WorkoutLog log = workoutLogRepo.findById(sessionId).orElseThrow();
        if (!log.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        List<ExerciseSession> sessions = sessionRepo.findAllByWorkoutLog(log);
        StringBuilder contextText = new StringBuilder();
        
        contextText.append(String.format("Workout: %s on %s\n", 
            log.getDayName(), log.getCompletedAt().format(DateTimeFormatter.ofPattern("EEE MMM dd"))));
        
        double totalVolume = 0;
        for (ExerciseSession session : sessions) {
            contextText.append(String.format("- %s: %dx%d @ %.1fkg\n", 
                session.getExerciseName(), session.getSetsCompleted(), session.getRepsPerSet(), session.getWeightUsed()));
            if (session.getSetsCompleted() != null && session.getRepsPerSet() != null && session.getWeightUsed() != null) {
                totalVolume += session.getSetsCompleted() * session.getRepsPerSet() * session.getWeightUsed();
            }
        }
        contextText.append(String.format("Total Session Volume: %.1fkg\n", totalVolume));

        return AiAgentContext.builder()
                .userId(userId)
                .contextText(contextText.toString())
                .build();
    }

    public AiAgentContext buildChatContext(Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        List<WorkoutLog> logs = workoutLogRepo.findAllByUserOrderByCompletedAtDesc(user).stream().limit(3).collect(Collectors.toList());
        List<PR> prs = prRepo.findAllByUser(user).stream().limit(3).collect(Collectors.toList());
        
        StringBuilder contextText = new StringBuilder();
        contextText.append(String.format("Current Date: %s\n\n", java.time.LocalDate.now().toString()));
        contextText.append("Last 3 Workouts:\n");
        for (WorkoutLog log : logs) {
            String dateStr = log.getCompletedAt() != null ? log.getCompletedAt().toLocalDate().toString() : "In Progress";
            contextText.append(String.format("- %s (%s)\n", log.getDayName(), dateStr));
        }
        
        contextText.append("\nTop PRs:\n");
        for (PR pr : prs) {
            contextText.append(String.format("- %s: %.1fkg\n", pr.getExerciseName(), pr.getMaxWeight()));
        }

        return AiAgentContext.builder()
                .userId(userId)
                .userDisplayName(user.getFullName())
                .contextText(contextText.toString())
                .build();
    }
}
