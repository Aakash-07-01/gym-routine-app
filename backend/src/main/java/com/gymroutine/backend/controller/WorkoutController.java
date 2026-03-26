package com.gymroutine.backend.controller;

import com.gymroutine.backend.dto.WorkoutCompleteRequest;
import com.gymroutine.backend.model.WorkoutLog;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.service.WorkoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/workout")
public class WorkoutController {
    private final WorkoutService service;

    public WorkoutController(WorkoutService service) {
        this.service = service;
    }

    @PostMapping("/complete")
    public ResponseEntity<WorkoutLog> completeWorkout(@AuthenticationPrincipal User user,
            @RequestBody WorkoutCompleteRequest req) {
        return ResponseEntity.ok(service.completeWorkout(user, req));
    }

    @GetMapping("/suggestion")
    public ResponseEntity<Map<String, String>> getSuggestion(@AuthenticationPrincipal User user,
            @RequestParam String exercise) {
        String suggestion = service.getSuggestion(user, exercise);
        return ResponseEntity.ok(Map.of("suggestion", suggestion != null ? suggestion : ""));
    }

    @GetMapping("/rest-advisory")
    public ResponseEntity<Map<String, Boolean>> getRestAdvisory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("needsRest", service.needsRest(user)));
    }
}
