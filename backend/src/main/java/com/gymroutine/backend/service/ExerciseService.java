package com.gymroutine.backend.service;

import com.gymroutine.backend.model.Exercise;
import com.gymroutine.backend.repository.ExerciseRepository;
import org.springframework.stereotype.Service;

@Service
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    public Exercise updateExercise(Long id, Exercise updatedExercise) {
        Exercise existing = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        existing.setName(updatedExercise.getName());
        existing.setSets(updatedExercise.getSets());
        existing.setReps(updatedExercise.getReps());
        existing.setWeight(updatedExercise.getWeight());
        existing.setNotes(updatedExercise.getNotes());
        existing.setOrderIndex(updatedExercise.getOrderIndex());
        if (updatedExercise.getRestTimer() != null) {
            existing.setRestTimer(updatedExercise.getRestTimer());
        }

        return exerciseRepository.save(existing);
    }

    public void deleteExercise(Long id) {
        exerciseRepository.deleteById(id);
    }

    public Exercise markComplete(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        exercise.setDone(!exercise.isDone());
        return exerciseRepository.save(exercise);
    }
}
