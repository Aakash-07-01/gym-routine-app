package com.gymroutine.backend.ai;

import com.gymroutine.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, Long> {
    Optional<AiInsight> findTopByUserAndInsightTypeAndWeekStart(User user, String insightType, LocalDate weekStart);
    Optional<AiInsight> findTopBySessionIdAndInsightType(Long sessionId, String insightType);
}
