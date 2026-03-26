package com.gymroutine.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class NutritionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String mealName;
    private Integer calories;
    private Integer proteinGram;
    private Integer carbsGram;
    private Integer fatGram;

    private LocalDateTime logDate;

    public NutritionLog() {
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

    public String getMealName() {
        return mealName;
    }

    public void setMealName(String mealName) {
        this.mealName = mealName;
    }

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }

    public Integer getProteinGram() {
        return proteinGram;
    }

    public void setProteinGram(Integer proteinGram) {
        this.proteinGram = proteinGram;
    }

    public Integer getCarbsGram() {
        return carbsGram;
    }

    public void setCarbsGram(Integer carbsGram) {
        this.carbsGram = carbsGram;
    }

    public Integer getFatGram() {
        return fatGram;
    }

    public void setFatGram(Integer fatGram) {
        this.fatGram = fatGram;
    }

    public LocalDateTime getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDateTime logDate) {
        this.logDate = logDate;
    }
}
