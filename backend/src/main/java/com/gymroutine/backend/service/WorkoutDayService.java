package com.gymroutine.backend.service;

import com.gymroutine.backend.model.Split;
import com.gymroutine.backend.model.WorkoutDay;
import com.gymroutine.backend.repository.SplitRepository;
import com.gymroutine.backend.repository.WorkoutDayRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutDayService {
    private final WorkoutDayRepository dayRepository;
    private final SplitRepository splitRepository;

    public WorkoutDayService(WorkoutDayRepository dayRepository, SplitRepository splitRepository) {
        this.dayRepository = dayRepository;
        this.splitRepository = splitRepository;
    }

    public List<WorkoutDay> getDaysForSplit(Long splitId, String username) {
        verifySplitAccess(splitId, username);
        return dayRepository.findBySplitIdOrderByDayOrderAsc(splitId);
    }

    public WorkoutDay createDay(Long splitId, WorkoutDay day, String username) {
        Split split = verifySplitAccess(splitId, username);
        day.setSplit(split);
        if (day.getExercises() != null) {
            day.getExercises().forEach(ex -> ex.setWorkoutDay(day));
        }
        return dayRepository.save(day);
    }

    private Split verifySplitAccess(Long splitId, String username) {
        Split split = splitRepository.findById(splitId)
                .orElseThrow(() -> new RuntimeException("Split not found"));
        if (!split.isTemplate() && (split.getUser() == null || !split.getUser().getUsername().equals(username))) {
            throw new RuntimeException("Not authorized");
        }
        return split;
    }
}
