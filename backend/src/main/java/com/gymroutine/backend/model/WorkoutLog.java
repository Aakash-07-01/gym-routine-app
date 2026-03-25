package com.gymroutine.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workout_logs")
public class WorkoutLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference(value = "user-logs")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id", nullable = false)
    private WorkoutDay workoutDay;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @Transient
    private String dayName;

    @PostLoad
    protected void onLoad() {
        if (workoutDay != null) {
            dayName = workoutDay.getDayName();
        }
    }

    @PrePersist
    protected void onComplete() {
        completedAt = LocalDateTime.now();
    }

    public WorkoutLog() {
    }

    public WorkoutLog(Long id, User user, WorkoutDay workoutDay, LocalDateTime completedAt, String dayName) {
        this.id = id;
        this.user = user;
        this.workoutDay = workoutDay;
        this.completedAt = completedAt;
        this.dayName = dayName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public WorkoutDay getWorkoutDay() {
        return workoutDay;
    }

    public void setWorkoutDay(WorkoutDay workoutDay) {
        this.workoutDay = workoutDay;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getDayName() {
        return dayName;
    }

    public void setDayName(String dayName) {
        this.dayName = dayName;
    }

    public static WorkoutLogBuilder builder() {
        return new WorkoutLogBuilder();
    }

    public static class WorkoutLogBuilder {
        private Long id;
        private User user;
        private WorkoutDay workoutDay;
        private LocalDateTime completedAt;

        public WorkoutLogBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public WorkoutLogBuilder user(User user) {
            this.user = user;
            return this;
        }

        public WorkoutLogBuilder workoutDay(WorkoutDay workoutDay) {
            this.workoutDay = workoutDay;
            return this;
        }

        public WorkoutLogBuilder completedAt(LocalDateTime completedAt) {
            this.completedAt = completedAt;
            return this;
        }

        public WorkoutLog build() {
            WorkoutLog l = new WorkoutLog();
            l.id = this.id;
            l.user = this.user;
            l.workoutDay = this.workoutDay;
            l.completedAt = this.completedAt;
            return l;
        }
    }
}
