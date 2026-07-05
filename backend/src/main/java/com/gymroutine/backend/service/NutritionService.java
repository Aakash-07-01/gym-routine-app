package com.gymroutine.backend.service;

import com.gymroutine.backend.model.NutritionLog;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.NutritionLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.gymroutine.backend.ai.agent.AiAgentOrchestrator;

@Service
public class NutritionService {
    private final NutritionLogRepository repo;
    private final AiAgentOrchestrator orchestrator;

    public NutritionService(NutritionLogRepository repo, AiAgentOrchestrator orchestrator) {
        this.repo = repo;
        this.orchestrator = orchestrator;
    }

    public NutritionLog saveLog(User user, NutritionLog log) {
        log.setUser(user);
        if (log.getLogDate() == null) {
            log.setLogDate(LocalDateTime.now());
        }
        
        // Auto-calculate macros if they are not provided
        if (log.getCalories() == null || log.getCalories() == 0) {
            NutritionLog estimated = orchestrator.estimateMacrosForMeal(log.getMealName());
            log.setCalories(estimated.getCalories());
            log.setProteinGram(estimated.getProteinGram());
            log.setCarbsGram(estimated.getCarbsGram());
            log.setFatGram(estimated.getFatGram());
        }
        
        return repo.save(log);
    }

    public List<NutritionLog> getTodaysLogs(User user) {
        return repo.findAllByUserAndLogDateAfter(user, LocalDate.now().atStartOfDay());
    }
}
