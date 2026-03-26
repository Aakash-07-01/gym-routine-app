package com.gymroutine.backend.controller;

import com.gymroutine.backend.model.BodyMetricsLog;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.service.MetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {
    private final MetricsService service;

    public MetricsController(MetricsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<BodyMetricsLog>> getMetrics(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getMetrics(user));
    }

    @PostMapping
    public ResponseEntity<BodyMetricsLog> logMetric(@AuthenticationPrincipal User user,
            @RequestBody BodyMetricsLog log) {
        return ResponseEntity.ok(service.saveMetric(user, log));
    }
}
