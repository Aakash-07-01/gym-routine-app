package com.gymroutine.backend.controller;

import com.gymroutine.backend.model.NutritionLog;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.service.NutritionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {
    private final NutritionService service;

    public NutritionController(NutritionService service) {
        this.service = service;
    }

    @GetMapping("/today")
    public ResponseEntity<List<NutritionLog>> getTodaysNutrition(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getTodaysLogs(user));
    }

    @PostMapping
    public ResponseEntity<NutritionLog> logNutrition(@AuthenticationPrincipal User user,
            @RequestBody NutritionLog log) {
        return ResponseEntity.ok(service.saveLog(user, log));
    }
}
