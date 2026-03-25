package com.gymroutine.backend.service;

import com.gymroutine.backend.model.*;
import com.gymroutine.backend.repository.SplitRepository;
import com.gymroutine.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SplitService {
    private final SplitRepository splitRepository;
    private final UserRepository userRepository;

    public SplitService(SplitRepository splitRepository, UserRepository userRepository) {
        this.splitRepository = splitRepository;
        this.userRepository = userRepository;
    }

    public List<Split> getUserSplits(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return splitRepository.findByUserId(user.getId());
    }

    public List<Split> getTemplates() {
        return splitRepository.findByIsTemplateTrue();
    }

    public Split createSplit(String username, Split split) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        split.setUser(user);
        split.setTemplate(false);
        if (split.getWorkoutDays() != null) {
            split.getWorkoutDays().forEach(day -> {
                day.setSplit(split);
                if (day.getExercises() != null) {
                    day.getExercises().forEach(ex -> ex.setWorkoutDay(day));
                }
            });
        }
        return splitRepository.save(split);
    }

    @Transactional
    public Split loadTemplate(Long templateId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Split template = splitRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.isTemplate()) {
            throw new RuntimeException("Not a template");
        }

        Split userSplit = Split.builder()
                .user(user)
                .name(template.getName())
                .isDefault(false)
                .isTemplate(false)
                .workoutDays(new ArrayList<>())
                .build();

        if (template.getWorkoutDays() != null) {
            for (WorkoutDay templateDay : template.getWorkoutDays()) {
                WorkoutDay day = WorkoutDay.builder()
                        .split(userSplit)
                        .dayName(templateDay.getDayName())
                        .dayOrder(templateDay.getDayOrder())
                        .exercises(new ArrayList<>())
                        .build();

                if (templateDay.getExercises() != null) {
                    for (Exercise templateEx : templateDay.getExercises()) {
                        Exercise ex = Exercise.builder()
                                .workoutDay(day)
                                .name(templateEx.getName())
                                .sets(templateEx.getSets())
                                .reps(templateEx.getReps())
                                .weight(templateEx.getWeight())
                                .notes(templateEx.getNotes())
                                .orderIndex(templateEx.getOrderIndex())
                                .restTimer(templateEx.getRestTimer())
                                .isDone(false)
                                .build();
                        day.getExercises().add(ex);
                    }
                }
                userSplit.getWorkoutDays().add(day);
            }
        }

        return splitRepository.save(userSplit);
    }

    public Split updateSplit(Long id, Split updatedSplit, String username) {
        Split existing = splitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Split not found"));
        if (existing.getUser() == null || !existing.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }
        existing.setName(updatedSplit.getName());
        return splitRepository.save(existing);
    }

    public void deleteSplit(Long id, String username) {
        Split existing = splitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Split not found"));
        if (existing.getUser() == null || !existing.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized");
        }
        splitRepository.deleteById(id);
    }
}
