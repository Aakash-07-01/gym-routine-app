package com.gymroutine.backend.service;

import com.gymroutine.backend.model.NutritionLog;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.NutritionLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NutritionService {
    private final NutritionLogRepository repo;

    public NutritionService(NutritionLogRepository repo) {
        this.repo = repo;
    }

    public NutritionLog saveLog(User user, NutritionLog log) {
        log.setUser(user);
        if (log.getLogDate() == null) {
            log.setLogDate(LocalDateTime.now());
        }
        return repo.save(log);
    }

    public List<NutritionLog> getTodaysLogs(User user) {
        return repo.findAllByUserAndLogDateAfter(user, LocalDate.now().atStartOfDay());
    }
}
