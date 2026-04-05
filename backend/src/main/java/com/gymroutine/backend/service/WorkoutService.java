package com.gymroutine.backend.service;

import com.gymroutine.backend.dto.WorkoutCompleteRequest;
import com.gymroutine.backend.model.*;
import com.gymroutine.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

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

                int setsToSave = stat.sets;
                int repsToSave = stat.reps;
                double weightToSave = stat.weight;

                if (stat.setsList != null && !stat.setsList.isEmpty()) {
                    setsToSave = stat.setsList.size();
                    // Find the max weight and max reps for backwards compatibility
                    for (WorkoutCompleteRequest.SetStat s : stat.setsList) {
                        if (s.weight > weightToSave || (s.weight == weightToSave && s.reps > repsToSave)) {
                            weightToSave = s.weight;
                            repsToSave = s.reps;
                        }
                    }
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        session.setSetsData(mapper.writeValueAsString(stat.setsList));
                    } catch (JsonProcessingException e) {
                        e.printStackTrace();
                    }
                }

                session.setSetsCompleted(setsToSave);
                session.setRepsPerSet(repsToSave);
                session.setWeightUsed(weightToSave);
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
                    pr.setMaxWeight(weightToSave);
                    pr.setMaxRepsAtWeight(repsToSave);
                    pr.setDateAchieved(LocalDateTime.now());
                    prRepo.save(pr);
                } else if (weightToSave > pr.getMaxWeight()
                        || (weightToSave == pr.getMaxWeight() && repsToSave > pr.getMaxRepsAtWeight())) {
                    pr.setMaxWeight(weightToSave);
                    pr.setMaxRepsAtWeight(repsToSave);
                    pr.setDateAchieved(LocalDateTime.now());
                    prRepo.save(pr);
                }
            }
        }
        return wlog;
    }

    public java.util.Map<String, Object> getSuggestion(User user, String exerciseName) {
        List<ExerciseSession> sessions = sessionRepo.findAllByUserAndExerciseNameOrderByCompletedAtDesc(user,
                exerciseName);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("suggestion", null);
        response.put("pastSets", null);

        if (sessions.isEmpty()) {
            return response;
        }

        ExerciseSession lastSession = sessions.get(0);

        if (lastSession.getSetsData() != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                List<java.util.Map<String, Object>> pastSets = mapper.readValue(lastSession.getSetsData(),
                        new com.fasterxml.jackson.core.type.TypeReference<List<java.util.Map<String, Object>>>() {
                        });
                response.put("pastSets", pastSets);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        String suggestion = null;
        if (sessions.size() >= 2) {
            ExerciseSession s1 = sessions.get(0);
            ExerciseSession s2 = sessions.get(1);
            if (s1.getWeightUsed() != null && s1.getWeightUsed().equals(s2.getWeightUsed()) &&
                    s1.getRepsPerSet() != null && s1.getRepsPerSet().equals(s2.getRepsPerSet())) {
                double bump = "lbs".equalsIgnoreCase(user.getUnitPreference()) ? 5.0 : 2.5;
                String unit = (user.getUnitPreference() != null && user.getUnitPreference().startsWith("I")) ? "lbs"
                        : "kg";
                suggestion = "Target Bump: " + (s1.getWeightUsed() + bump) + unit;
            } else if (s1.getWeightUsed() != null) {
                suggestion = "Last Best: " + s1.getWeightUsed() + " for " + s1.getRepsPerSet() + " reps.";
            }
        } else if (lastSession.getWeightUsed() != null) {
            suggestion = "Last Best: " + lastSession.getWeightUsed() + " for " + lastSession.getRepsPerSet() + " reps.";
        }

        response.put("suggestion", suggestion);
        return response;
    }

    public boolean needsRest(User user) {
        LocalDateTime fiveDaysAgo = LocalDateTime.now().minusDays(5);
        List<WorkoutLog> logs = logRepo.findAllByUserAndCompletedAtAfterOrderByCompletedAtDesc(user, fiveDaysAgo);
        long distinctDays = logs.stream().map(l -> l.getCompletedAt().toLocalDate()).distinct().count();
        return distinctDays >= 5;
    }
}
