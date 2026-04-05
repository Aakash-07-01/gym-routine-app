package com.gymroutine.backend.dto;

public class UpdateProfileRequest {
    private String fullName;
    private String email;
    private Double height;
    private Double startingWeight;
    private Double currentWeight;
    private String primaryGoal;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public Double getStartingWeight() {
        return startingWeight;
    }

    public void setStartingWeight(Double startingWeight) {
        this.startingWeight = startingWeight;
    }

    public Double getCurrentWeight() {
        return currentWeight;
    }

    public void setCurrentWeight(Double currentWeight) {
        this.currentWeight = currentWeight;
    }

    public String getPrimaryGoal() {
        return primaryGoal;
    }

    public void setPrimaryGoal(String primaryGoal) {
        this.primaryGoal = primaryGoal;
    }
}
