package com.gymroutine.backend.dto;

import java.util.List;

public class WorkoutCompleteRequest {
    private Long splitId;
    private String dayId;
    private String dayName;
    private List<ExerciseStat> exercises;

    public WorkoutCompleteRequest() {
    }

    public Long getSplitId() {
        return splitId;
    }

    public void setSplitId(Long splitId) {
        this.splitId = splitId;
    }

    public String getDayId() {
        return dayId;
    }

    public void setDayId(String dayId) {
        this.dayId = dayId;
    }

    public String getDayName() {
        return dayName;
    }

    public void setDayName(String dayName) {
        this.dayName = dayName;
    }

    public List<ExerciseStat> getExercises() {
        return exercises;
    }

    public void setExercises(List<ExerciseStat> exercises) {
        this.exercises = exercises;
    }

    public static class ExerciseStat {
        public String name;
        public int sets;
        public int reps;
        public double weight;
    }
}
