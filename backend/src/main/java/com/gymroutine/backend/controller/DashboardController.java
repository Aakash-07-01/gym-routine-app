package com.gymroutine.backend.controller;

import com.gymroutine.backend.dto.DashboardDTO;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardDTO> getDashboardSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getDashboardData(user));
    }

    @GetMapping("/weekly")
    public ResponseEntity<Map<String, Object>> getWeeklySummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getWeeklySummary(user));
    }
}
