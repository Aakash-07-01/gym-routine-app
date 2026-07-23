package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.ExerciseSession;
import com.gymroutine.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseSessionRepository extends JpaRepository<ExerciseSession, Long> {
    List<ExerciseSession> findAllByUserAndExerciseNameOrderByCompletedAtDesc(User user, String exerciseName);
    
    List<ExerciseSession> findAllByUserOrderByCompletedAtAsc(User user);

    List<ExerciseSession> findAllByWorkoutLog(com.gymroutine.backend.model.WorkoutLog workoutLog);

    List<ExerciseSession> findAllByWorkoutLogIn(List<com.gymroutine.backend.model.WorkoutLog> workoutLogs);
}
