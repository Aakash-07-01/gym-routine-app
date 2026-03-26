package com.gymroutine.backend.dto;

import java.time.LocalDate;

public class RegisterRequest {
    private String fullName;
    private String username;
    private String email;
    private String password;
    private LocalDate dob;
    private String biologicalSex;
    private Double height;
    private Double startingWeight;
    private String primaryGoal;
    private String experienceLevel;
    private String unitPreference;

    public RegisterRequest() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getBiologicalSex() {
        return biologicalSex;
    }

    public void setBiologicalSex(String biologicalSex) {
        this.biologicalSex = biologicalSex;
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

    public String getPrimaryGoal() {
        return primaryGoal;
    }

    public void setPrimaryGoal(String primaryGoal) {
        this.primaryGoal = primaryGoal;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public String getUnitPreference() {
        return unitPreference;
    }

    public void setUnitPreference(String unitPreference) {
        this.unitPreference = unitPreference;
    }
}
