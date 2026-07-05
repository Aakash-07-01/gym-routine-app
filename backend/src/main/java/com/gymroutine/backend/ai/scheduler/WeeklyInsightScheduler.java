package com.gymroutine.backend.ai.scheduler;

import com.gymroutine.backend.ai.agent.AiAgentOrchestrator;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WeeklyInsightScheduler {

    private static final Logger log = LoggerFactory.getLogger(WeeklyInsightScheduler.class);
    
    private final AiAgentOrchestrator orchestrator;
    private final UserRepository userRepository;

    public WeeklyInsightScheduler(AiAgentOrchestrator orchestrator, UserRepository userRepository) {
        this.orchestrator = orchestrator;
        this.userRepository = userRepository;
    }

    @Scheduled(cron = "0 0 21 * * SUN", zone = "UTC")
    public void generateWeeklyInsightsForAllUsers() {
        List<Long> userIds = userRepository.findAll().stream().map(User::getId).toList();
        log.info("Starting weekly insight generation for {} users", userIds.size());

        for (Long userId : userIds) {
            try {
                orchestrator.generateWeeklyInsight(userId);
                Thread.sleep(500); // Small delay to avoid hitting rate limits too fast
            } catch (Exception e) {
                log.error("Failed to generate weekly insight for user {}", userId, e);
            }
        }

        log.info("Completed weekly insight generation");
    }
}
