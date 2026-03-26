package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.PR;
import com.gymroutine.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PRRepository extends JpaRepository<PR, Long> {
    List<PR> findAllByUser(User user);
}
