package com.gymroutine.backend.dto;

public class DashboardDTO {
    private Double caloriesBurnedToday;
    private String todaysFocus;
    private Double currentWeight;
    private Double currentBodyFat;
    private Integer streak;
    private Integer activePRs;
    private String aiInsight;

    public DashboardDTO() {
    }

    public Double getCaloriesBurnedToday() {
        return caloriesBurnedToday;
    }

    public void setCaloriesBurnedToday(Double caloriesBurnedToday) {
        this.caloriesBurnedToday = caloriesBurnedToday;
    }

    public String getTodaysFocus() {
        return todaysFocus;
    }

    public void setTodaysFocus(String todaysFocus) {
        this.todaysFocus = todaysFocus;
    }

    public Double getCurrentWeight() {
        return currentWeight;
    }

    public void setCurrentWeight(Double currentWeight) {
        this.currentWeight = currentWeight;
    }

    public Double getCurrentBodyFat() {
        return currentBodyFat;
    }

    public void setCurrentBodyFat(Double currentBodyFat) {
        this.currentBodyFat = currentBodyFat;
    }

    public Integer getStreak() {
        return streak;
    }

    public void setStreak(Integer streak) {
        this.streak = streak;
    }

    public Integer getActivePRs() {
        return activePRs;
    }

    public void setActivePRs(Integer activePRs) {
        this.activePRs = activePRs;
    }

    public String getAiInsight() {
        return aiInsight;
    }

    public void setAiInsight(String aiInsight) {
        this.aiInsight = aiInsight;
    }
}
