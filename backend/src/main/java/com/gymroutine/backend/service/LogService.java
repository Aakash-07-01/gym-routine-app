package com.gymroutine.backend.service;

import com.gymroutine.backend.model.User;
import com.gymroutine.backend.model.WorkoutDay;
import com.gymroutine.backend.model.WorkoutLog;
import com.gymroutine.backend.repository.UserRepository;
import com.gymroutine.backend.repository.WorkoutDayRepository;
import com.gymroutine.backend.repository.WorkoutLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LogService {
        private final WorkoutLogRepository logRepository;
        private final UserRepository userRepository;
        private final WorkoutDayRepository dayRepository;

        public LogService(WorkoutLogRepository logRepository, UserRepository userRepository,
                        WorkoutDayRepository dayRepository) {
                this.logRepository = logRepository;
                this.userRepository = userRepository;
                this.dayRepository = dayRepository;
        }

        public WorkoutLog logWorkout(Long dayId, String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                WorkoutDay day = dayRepository.findById(dayId)
                                .orElseThrow(() -> new RuntimeException("WorkoutDay not found"));

                WorkoutLog log = WorkoutLog.builder()
                                .user(user)
                                .workoutDay(day)
                                .build();
                return logRepository.save(log);
        }

        public List<WorkoutLog> getWeeklyLogs(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
                return logRepository.findByUserIdAndCompletedAtAfter(user.getId(), oneWeekAgo);
        }
}
