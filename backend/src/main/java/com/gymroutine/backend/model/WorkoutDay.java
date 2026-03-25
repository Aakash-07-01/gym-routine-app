package com.gymroutine.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "workout_days")
public class WorkoutDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "split_id", nullable = false)
    @JsonBackReference(value = "split-days")
    private Split split;

    @Column(name = "day_name", nullable = false)
    private String dayName;

    @Column(name = "day_order", nullable = false)
    private int dayOrder;

    @OneToMany(mappedBy = "workoutDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "day-exercises")
    private List<Exercise> exercises;

    public WorkoutDay() {
    }

    public WorkoutDay(Long id, Split split, String dayName, int dayOrder, List<Exercise> exercises) {
        this.id = id;
        this.split = split;
        this.dayName = dayName;
        this.dayOrder = dayOrder;
        this.exercises = exercises;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Split getSplit() {
        return split;
    }

    public void setSplit(Split split) {
        this.split = split;
    }

    public String getDayName() {
        return dayName;
    }

    public void setDayName(String dayName) {
        this.dayName = dayName;
    }

    public int getDayOrder() {
        return dayOrder;
    }

    public void setDayOrder(int dayOrder) {
        this.dayOrder = dayOrder;
    }

    public List<Exercise> getExercises() {
        return exercises;
    }

    public void setExercises(List<Exercise> exercises) {
        this.exercises = exercises;
    }

    public static WorkoutDayBuilder builder() {
        return new WorkoutDayBuilder();
    }

    public static class WorkoutDayBuilder {
        private Long id;
        private Split split;
        private String dayName;
        private int dayOrder;
        private List<Exercise> exercises;

        public WorkoutDayBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public WorkoutDayBuilder split(Split split) {
            this.split = split;
            return this;
        }

        public WorkoutDayBuilder dayName(String dayName) {
            this.dayName = dayName;
            return this;
        }

        public WorkoutDayBuilder dayOrder(int dayOrder) {
            this.dayOrder = dayOrder;
            return this;
        }

        public WorkoutDayBuilder exercises(List<Exercise> exercises) {
            this.exercises = exercises;
            return this;
        }

        public WorkoutDay build() {
            WorkoutDay d = new WorkoutDay();
            d.id = this.id;
            d.split = this.split;
            d.dayName = this.dayName;
            d.dayOrder = this.dayOrder;
            d.exercises = this.exercises;
            return d;
        }
    }
}
