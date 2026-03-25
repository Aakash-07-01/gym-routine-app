package com.gymroutine.backend.controller;

import com.gymroutine.backend.model.WorkoutDay;
import com.gymroutine.backend.service.WorkoutDayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/splits/{splitId}/days")
public class WorkoutDayController {

    private final WorkoutDayService dayService;

    public WorkoutDayController(WorkoutDayService dayService) {
        this.dayService = dayService;
    }

    @GetMapping
    public ResponseEntity<List<WorkoutDay>> getDays(@PathVariable Long splitId, Authentication authentication) {
        return ResponseEntity.ok(dayService.getDaysForSplit(splitId, authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<WorkoutDay> createDay(@PathVariable Long splitId, @RequestBody WorkoutDay day,
            Authentication authentication) {
        return ResponseEntity.ok(dayService.createDay(splitId, day, authentication.getName()));
    }
}
