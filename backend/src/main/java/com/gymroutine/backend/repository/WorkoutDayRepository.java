package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.WorkoutDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutDayRepository extends JpaRepository<WorkoutDay, Long> {
    List<WorkoutDay> findBySplitIdOrderByDayOrderAsc(Long splitId);
}
