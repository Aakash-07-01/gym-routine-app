package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.DailyNote;
import com.gymroutine.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DailyNoteRepository extends JpaRepository<DailyNote, Long> {
    List<DailyNote> findAllByUserOrderByDateDesc(User user);

    Optional<DailyNote> findFirstByUserOrderByDateDesc(User user);
}
