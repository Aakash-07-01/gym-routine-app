package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.BodyMetricsLog;
import com.gymroutine.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BodyMetricsLogRepository extends JpaRepository<BodyMetricsLog, Long> {
    List<BodyMetricsLog> findAllByUserOrderByDateLoggedDesc(User user);

    Optional<BodyMetricsLog> findFirstByUserOrderByDateLoggedDesc(User user);
}
