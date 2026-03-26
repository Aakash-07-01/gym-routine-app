package com.gymroutine.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class CardioLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String type; // Running, Walking, Cycling, etc.
    private Integer durationMinutes;
    private String intensity; // Low, Moderate, High
    private Double estimatedCaloriesBurned;

    private LocalDateTime dateLogged;

    public CardioLog() {
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getIntensity() {
        return intensity;
    }

    public void setIntensity(String intensity) {
        this.intensity = intensity;
    }

    public Double getEstimatedCaloriesBurned() {
        return estimatedCaloriesBurned;
    }

    public void setEstimatedCaloriesBurned(Double estimatedCaloriesBurned) {
        this.estimatedCaloriesBurned = estimatedCaloriesBurned;
    }

    public LocalDateTime getDateLogged() {
        return dateLogged;
    }

    public void setDateLogged(LocalDateTime dateLogged) {
        this.dateLogged = dateLogged;
    }
}
