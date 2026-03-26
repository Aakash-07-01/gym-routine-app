package com.gymroutine.backend.service;

import com.gymroutine.backend.model.CardioLog;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.CardioLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CardioService {
    private final CardioLogRepository repository;

    public CardioService(CardioLogRepository repository) {
        this.repository = repository;
    }

    public CardioLog saveCardio(User user, CardioLog log) {
        log.setUser(user);
        log.setDateLogged(LocalDateTime.now());

        double met = 7.0;
        if (log.getType() != null) {
            switch (log.getType().toLowerCase()) {
                case "running":
                    met = 9.8;
                    break;
                case "walking":
                    met = 3.8;
                    break;
                case "cycling":
                    met = 7.5;
                    break;
                case "swimming":
                    met = 8.0;
                    break;
                case "hiit":
                    met = 12.0;
                    break;
                case "rowing":
                    met = 8.5;
                    break;
                case "stair climber":
                    met = 9.0;
                    break;
            }
        }

        double weight = user.getStartingWeight() != null ? user.getStartingWeight() : 75.0;
        if ("lbs".equalsIgnoreCase(user.getUnitPreference())) {
            weight = weight / 2.20462; // Convert lbs to kg for MET calculation
        }

        double calories = (met * weight * 3.5) / 200
                * (log.getDurationMinutes() != null ? log.getDurationMinutes() : 0);
        log.setEstimatedCaloriesBurned(calories);

        return repository.save(log);
    }
}
