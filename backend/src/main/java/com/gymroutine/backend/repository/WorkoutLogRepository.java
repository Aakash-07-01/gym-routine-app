package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gymroutine.backend.model.User;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByUserIdAndCompletedAtAfter(Long userId, LocalDateTime startDate);

    List<WorkoutLog> findAllByUserOrderByCompletedAtDesc(User user);

    List<WorkoutLog> findAllByUserAndCompletedAtAfterOrderByCompletedAtDesc(User user, LocalDateTime after);
}
