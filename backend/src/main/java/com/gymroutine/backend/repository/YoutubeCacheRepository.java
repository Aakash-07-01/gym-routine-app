package com.gymroutine.backend.repository;

import com.gymroutine.backend.model.YoutubeCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface YoutubeCacheRepository extends JpaRepository<YoutubeCache, Long> {
    Optional<YoutubeCache> findByExerciseNameIgnoreCase(String exerciseName);
}
