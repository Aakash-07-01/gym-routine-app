package com.gymroutine.backend.service;

import com.gymroutine.backend.dto.WorkoutCompleteRequest;
import com.gymroutine.backend.model.*;
import com.gymroutine.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class WorkoutService {
    private final WorkoutLogRepository logRepo;
    private final ExerciseSessionRepository sessionRepo;
    private final PRRepository prRepo;

    public WorkoutService(WorkoutLogRepository logRepo, ExerciseSessionRepository sessionRepo, PRRepository prRepo) {
        this.logRepo = logRepo;
        this.sessionRepo = sessionRepo;
        this.prRepo = prRepo;
    }

    public WorkoutLog completeWorkout(User user, WorkoutCompleteRequest req) {
        WorkoutLog wlog = new WorkoutLog();
        wlog.setUser(user);
        wlog.setDayName(req.getDayName() != null ? req.getDayName() : "Custom Day");
        // wlog.setWorkoutDay(...) -> Nullable for now.
        wlog = logRepo.save(wlog);

        if (req.getExercises() != null) {
            for (WorkoutCompleteRequest.ExerciseStat stat : req.getExercises()) {
                if (stat.name == null)
                    continue;

                ExerciseSession session = new ExerciseSession();
                session.setUser(user);
                session.setWorkoutLog(wlog);
                session.setExerciseName(stat.name);
                session.setSetsCompleted(stat.sets);
                session.setRepsPerSet(stat.reps);
                session.setWeightUsed(stat.weight);
                session.setCompletedAt(LocalDateTime.now());
                sessionRepo.save(session);

                // Update PR logic
                List<PR> existingPrs = prRepo.findAllByUser(user);
                PR pr = existingPrs.stream().filter(p -> p.getExerciseName().equalsIgnoreCase(stat.name)).findFirst()
                        .orElse(null);

                if (pr == null) {
                    pr = new PR();
                    pr.setUser(user);
                    pr.setExerciseName(stat.name);
                    pr.setMaxWeight(stat.weight);
                    pr.setMaxRepsAtWeight(stat.reps);
                    pr.setDateAchieved(LocalDateTime.now());
                    prRepo.save(pr);
                } else if (stat.weight > pr.getMaxWeight()
                        || (stat.weight == pr.getMaxWeight() && stat.reps > pr.getMaxRepsAtWeight())) {
                    pr.setMaxWeight(stat.weight);
                    pr.setMaxRepsAtWeight(stat.reps);
                    pr.setDateAchieved(LocalDateTime.now());
                    prRepo.save(pr);
                }
            }
        }
        return wlog;
    }

    public String getSuggestion(User user, String exerciseName) {
        List<ExerciseSession> sessions = sessionRepo.findAllByUserAndExerciseNameOrderByCompletedAtDesc(user,
                exerciseName);
        if (sessions.size() >= 3) {
            ExerciseSession s1 = sessions.get(0);
            ExerciseSession s2 = sessions.get(1);
            ExerciseSession s3 = sessions.get(2);

            // Plateau Detection: Same weight and reps for 3 consecutive sessions
            if (s1.getWeightUsed().equals(s2.getWeightUsed()) && s2.getWeightUsed().equals(s3.getWeightUsed()) &&
                    s1.getRepsPerSet().equals(s2.getRepsPerSet()) && s2.getRepsPerSet().equals(s3.getRepsPerSet())) {

                double bump = "lbs".equalsIgnoreCase(user.getUnitPreference()) ? 5.0 : 2.5;
                return "Plateau Detected! Target Weight: " + (s1.getWeightUsed() + bump)
                        + (user.getUnitPreference() != null && user.getUnitPreference().startsWith("I") ? "lbs" : "kg");
            }
        }
        return null;
    }

    public boolean needsRest(User user) {
        LocalDateTime fiveDaysAgo = LocalDateTime.now().minusDays(5);
        List<WorkoutLog> logs = logRepo.findAllByUserAndCompletedAtAfterOrderByCompletedAtDesc(user, fiveDaysAgo);
        long distinctDays = logs.stream().map(l -> l.getCompletedAt().toLocalDate()).distinct().count();
        return distinctDays >= 5;
    }
}
