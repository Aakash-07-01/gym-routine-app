package com.gymroutine.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "splits")
public class Split {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference(value = "user-splits")
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;

    @Column(name = "is_template", nullable = false)
    private boolean isTemplate;

    @OneToMany(mappedBy = "split", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference(value = "split-days")
    private List<WorkoutDay> workoutDays;

    public Split() {
    }

    public Split(Long id, User user, String name, boolean isDefault, boolean isTemplate, List<WorkoutDay> workoutDays) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.isDefault = isDefault;
        this.isTemplate = isTemplate;
        this.workoutDays = workoutDays;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

    public boolean isTemplate() {
        return isTemplate;
    }

    public void setTemplate(boolean isTemplate) {
        this.isTemplate = isTemplate;
    }

    public List<WorkoutDay> getWorkoutDays() {
        return workoutDays;
    }

    public void setWorkoutDays(List<WorkoutDay> workoutDays) {
        this.workoutDays = workoutDays;
    }

    public static SplitBuilder builder() {
        return new SplitBuilder();
    }

    public static class SplitBuilder {
        private Long id;
        private User user;
        private String name;
        private boolean isDefault;
        private boolean isTemplate;
        private List<WorkoutDay> workoutDays;

        public SplitBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public SplitBuilder user(User user) {
            this.user = user;
            return this;
        }

        public SplitBuilder name(String name) {
            this.name = name;
            return this;
        }

        public SplitBuilder isDefault(boolean isDefault) {
            this.isDefault = isDefault;
            return this;
        }

        public SplitBuilder isTemplate(boolean isTemplate) {
            this.isTemplate = isTemplate;
            return this;
        }

        public SplitBuilder workoutDays(List<WorkoutDay> workoutDays) {
            this.workoutDays = workoutDays;
            return this;
        }

        public Split build() {
            Split s = new Split();
            s.id = this.id;
            s.user = this.user;
            s.name = this.name;
            s.isDefault = this.isDefault;
            s.isTemplate = this.isTemplate;
            s.workoutDays = this.workoutDays;
            return s;
        }
    }
}
