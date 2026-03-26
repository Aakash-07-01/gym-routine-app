package com.gymroutine.backend.service;

import com.gymroutine.backend.model.BodyMetricsLog;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.BodyMetricsLogRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MetricsService {
    private final BodyMetricsLogRepository repo;

    public MetricsService(BodyMetricsLogRepository repo) {
        this.repo = repo;
    }

    public BodyMetricsLog saveMetric(User user, BodyMetricsLog log) {
        log.setUser(user);
        if (log.getDateLogged() == null) {
            log.setDateLogged(LocalDateTime.now());
        }
        return repo.save(log);
    }

    public List<BodyMetricsLog> getMetrics(User user) {
        return repo.findAllByUserOrderByDateLoggedDesc(user);
    }
}
