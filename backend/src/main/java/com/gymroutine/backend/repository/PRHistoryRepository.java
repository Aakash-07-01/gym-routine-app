package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.PRHistory;
import com.gymroutine.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PRHistoryRepository extends JpaRepository<PRHistory, Long> {
    List<PRHistory> findAllByUserAndExerciseNameOrderByDateAchievedDesc(User user, String exerciseName);
}
