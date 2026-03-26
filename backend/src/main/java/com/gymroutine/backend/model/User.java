package com.gymroutine.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private LocalDate dob;
    private String biologicalSex;
    private Double height;
    private Double startingWeight;
    private String primaryGoal;
    private String experienceLevel;
    private String unitPreference;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public User() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    @Override
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

    @Override
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private User user;

        public UserBuilder() {
            this.user = new User();
        }

        public UserBuilder id(Long id) {
            user.setId(id);
            return this;
        }

        public UserBuilder fullName(String fullName) {
            user.setFullName(fullName);
            return this;
        }

        public UserBuilder username(String username) {
            user.setUsername(username);
            return this;
        }

        public UserBuilder email(String email) {
            user.setEmail(email);
            return this;
        }

        public UserBuilder password(String password) {
            user.setPassword(password);
            return this;
        }

        public UserBuilder dob(LocalDate dob) {
            user.setDob(dob);
            return this;
        }

        public UserBuilder biologicalSex(String biologicalSex) {
            user.setBiologicalSex(biologicalSex);
            return this;
        }

        public UserBuilder height(Double height) {
            user.setHeight(height);
            return this;
        }

        public UserBuilder startingWeight(Double startingWeight) {
            user.setStartingWeight(startingWeight);
            return this;
        }

        public UserBuilder primaryGoal(String primaryGoal) {
            user.setPrimaryGoal(primaryGoal);
            return this;
        }

        public UserBuilder experienceLevel(String experienceLevel) {
            user.setExperienceLevel(experienceLevel);
            return this;
        }

        public UserBuilder unitPreference(String unitPreference) {
            user.setUnitPreference(unitPreference);
            return this;
        }

        public User build() {
            return user;
        }
    }
}
