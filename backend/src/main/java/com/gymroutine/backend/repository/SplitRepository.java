package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.Split;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SplitRepository extends JpaRepository<Split, Long> {
    List<Split> findByUserId(Long userId);

    List<Split> findByIsTemplateTrue();
}
