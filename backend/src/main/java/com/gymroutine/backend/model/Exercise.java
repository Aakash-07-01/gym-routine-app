package com.gymroutine.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "exercises")
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id", nullable = false)
    @JsonBackReference(value = "day-exercises")
    private WorkoutDay workoutDay;

    @Column(nullable = false)
    private String name;

    private Integer sets;
    private Integer reps;
    private Double weight;
    private String notes;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(name = "is_done")
    private boolean isDone = false;

    @Column(name = "rest_timer")
    private Integer restTimer;

    public Exercise() {
    }

    public Exercise(Long id, WorkoutDay workoutDay, String name, Integer sets, Integer reps,
            Double weight, String notes, int orderIndex, boolean isDone, Integer restTimer) {
        this.id = id;
        this.workoutDay = workoutDay;
        this.name = name;
        this.sets = sets;
        this.reps = reps;
        this.weight = weight;
        this.notes = notes;
        this.orderIndex = orderIndex;
        this.isDone = isDone;
        this.restTimer = restTimer;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public WorkoutDay getWorkoutDay() {
        return workoutDay;
    }

    public void setWorkoutDay(WorkoutDay workoutDay) {
        this.workoutDay = workoutDay;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getSets() {
        return sets;
    }

    public void setSets(Integer sets) {
        this.sets = sets;
    }

    public Integer getReps() {
        return reps;
    }

    public void setReps(Integer reps) {
        this.reps = reps;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public boolean isDone() {
        return isDone;
    }

    public void setDone(boolean done) {
        isDone = done;
    }

    public Integer getRestTimer() {
        return restTimer;
    }

    public void setRestTimer(Integer restTimer) {
        this.restTimer = restTimer;
    }

    public static ExerciseBuilder builder() {
        return new ExerciseBuilder();
    }

    public static class ExerciseBuilder {
        private Long id;
        private WorkoutDay workoutDay;
        private String name;
        private Integer sets;
        private Integer reps;
        private Double weight;
        private String notes;
        private int orderIndex;
        private boolean isDone = false;
        private Integer restTimer;

        public ExerciseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ExerciseBuilder workoutDay(WorkoutDay workoutDay) {
            this.workoutDay = workoutDay;
            return this;
        }

        public ExerciseBuilder name(String name) {
            this.name = name;
            return this;
        }

        public ExerciseBuilder sets(Integer sets) {
            this.sets = sets;
            return this;
        }

        public ExerciseBuilder reps(Integer reps) {
            this.reps = reps;
            return this;
        }

        public ExerciseBuilder weight(Double weight) {
            this.weight = weight;
            return this;
        }

        public ExerciseBuilder notes(String notes) {
            this.notes = notes;
            return this;
        }

        public ExerciseBuilder orderIndex(int orderIndex) {
            this.orderIndex = orderIndex;
            return this;
        }

        public ExerciseBuilder isDone(boolean isDone) {
            this.isDone = isDone;
            return this;
        }

        public ExerciseBuilder restTimer(Integer restTimer) {
            this.restTimer = restTimer;
            return this;
        }

        public Exercise build() {
            Exercise e = new Exercise();
            e.id = this.id;
            e.workoutDay = this.workoutDay;
            e.name = this.name;
            e.sets = this.sets;
            e.reps = this.reps;
            e.weight = this.weight;
            e.notes = this.notes;
            e.orderIndex = this.orderIndex;
            e.isDone = this.isDone;
            e.restTimer = this.restTimer;
            return e;
        }
    }
}
