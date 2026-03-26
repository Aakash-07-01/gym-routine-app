package com.gymroutine.backend.controller;

import com.gymroutine.backend.model.CardioLog;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.service.CardioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cardio")
public class CardioController {
    private final CardioService service;

    public CardioController(CardioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CardioLog> logCardio(@AuthenticationPrincipal User user, @RequestBody CardioLog log) {
        return ResponseEntity.ok(service.saveCardio(user, log));
    }
}
