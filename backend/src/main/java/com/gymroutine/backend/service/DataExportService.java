package com.gymroutine.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymroutine.backend.model.ExerciseSession;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.ExerciseSessionRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class DataExportService {

    private final ExerciseSessionRepository sessionRepo;
    private final ObjectMapper mapper;

    public DataExportService(ExerciseSessionRepository sessionRepo) {
        this.sessionRepo = sessionRepo;
        this.mapper = new ObjectMapper();
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public String generateCsv(User user) {
        List<ExerciseSession> sessions = sessionRepo.findAllByUserOrderByCompletedAtAsc(user);
        
        StringBuilder csvBuilder = new StringBuilder();
        // Header
        csvBuilder.append("Date,Workout Name,Exercise Name,Set Order,Weight,Weight Unit,Reps,RPE,Distance,Distance Unit,Seconds,Notes,Workout Notes\n");

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (ExerciseSession session : sessions) {
            String date = session.getCompletedAt() != null ? session.getCompletedAt().format(dateFormatter) : "";
            String workoutName = session.getWorkoutLog() != null ? session.getWorkoutLog().getDayName() : "Workout";
            String exerciseName = session.getExerciseName() != null ? session.getExerciseName() : "";
            String weightUnit = user.getUnitPreference() != null && user.getUnitPreference().startsWith("I") ? "lbs" : "kg";
            
            workoutName = escapeCsv(workoutName);
            exerciseName = escapeCsv(exerciseName);

            // Parse setsData JSON
            boolean setsParsed = false;
            if (session.getSetsData() != null && !session.getSetsData().isEmpty()) {
                try {
                    List<Map<String, Object>> setsList = mapper.readValue(session.getSetsData(), new TypeReference<List<Map<String, Object>>>() {});
                    int setOrder = 1;
                    for (Map<String, Object> set : setsList) {
                        double weight = set.containsKey("weight") && set.get("weight") != null ? Double.parseDouble(set.get("weight").toString()) : 0.0;
                        int reps = set.containsKey("reps") && set.get("reps") != null ? Integer.parseInt(set.get("reps").toString()) : 0;
                        int rpe = set.containsKey("rpe") && set.get("rpe") != null ? Integer.parseInt(set.get("rpe").toString()) : 0;
                        
                        csvBuilder.append(String.format("\"%s\",\"%s\",\"%s\",%d,%f,\"%s\",%d,%d,\"\",\"\",0,\"\",\"\"\n",
                                date, workoutName, exerciseName, setOrder++, weight, weightUnit, reps, rpe));
                        setsParsed = true;
                    }
                } catch (Exception e) {
                    // Ignore JSON parsing errors and fallback
                }
            }

            if (!setsParsed && session.getSetsCompleted() != null && session.getSetsCompleted() > 0) {
                // Fallback to top-level fields
                int sets = session.getSetsCompleted();
                double weight = session.getWeightUsed() != null ? session.getWeightUsed() : 0.0;
                int reps = session.getRepsPerSet() != null ? session.getRepsPerSet() : 0;

                for (int i = 1; i <= sets; i++) {
                    csvBuilder.append(String.format("\"%s\",\"%s\",\"%s\",%d,%f,\"%s\",%d,0,\"\",\"\",0,\"\",\"\"\n",
                            date, workoutName, exerciseName, i, weight, weightUnit, reps));
                }
            }
        }

        return csvBuilder.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
