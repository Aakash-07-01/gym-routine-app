package com.gymroutine.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class PR {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String exerciseName;
    private Double maxWeight;
    private Integer maxRepsAtWeight;

    private LocalDateTime dateAchieved;

    public PR() {
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

    public String getExerciseName() {
        return exerciseName;
    }

    public void setExerciseName(String exerciseName) {
        this.exerciseName = exerciseName;
    }

    public Double getMaxWeight() {
        return maxWeight;
    }

    public void setMaxWeight(Double maxWeight) {
        this.maxWeight = maxWeight;
    }

    public Integer getMaxRepsAtWeight() {
        return maxRepsAtWeight;
    }

    public void setMaxRepsAtWeight(Integer maxRepsAtWeight) {
        this.maxRepsAtWeight = maxRepsAtWeight;
    }

    public LocalDateTime getDateAchieved() {
        return dateAchieved;
    }

    public void setDateAchieved(LocalDateTime dateAchieved) {
        this.dateAchieved = dateAchieved;
    }
}
