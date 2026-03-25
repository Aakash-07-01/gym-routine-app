package com.gymroutine.backend.controller;

import com.gymroutine.backend.model.WorkoutLog;
import com.gymroutine.backend.service.LogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    @PostMapping
    public ResponseEntity<WorkoutLog> logWorkout(@RequestParam Long dayId, Authentication authentication) {
        return ResponseEntity.ok(logService.logWorkout(dayId, authentication.getName()));
    }

    @GetMapping("/week")
    public ResponseEntity<List<WorkoutLog>> getWeeklyLogs(Authentication authentication) {
        return ResponseEntity.ok(logService.getWeeklyLogs(authentication.getName()));
    }
}
