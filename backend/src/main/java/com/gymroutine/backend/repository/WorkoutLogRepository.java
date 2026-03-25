package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByUserIdAndCompletedAtAfter(Long userId, LocalDateTime startDate);
}
