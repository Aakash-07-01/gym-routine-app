package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.NutritionLog;
import com.gymroutine.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NutritionLogRepository extends JpaRepository<NutritionLog, Long> {
    List<NutritionLog> findAllByUserAndDateLoggedAfter(User user, LocalDateTime date);
}
