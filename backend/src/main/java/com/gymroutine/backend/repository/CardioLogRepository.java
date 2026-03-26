package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.CardioLog;
import com.gymroutine.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CardioLogRepository extends JpaRepository<CardioLog, Long> {
    List<CardioLog> findAllByUser(User user);

    List<CardioLog> findAllByUserAndDateLoggedAfter(User user, LocalDateTime date);
}
