package com.gymroutine.backend.controller;

import com.gymroutine.backend.model.PR;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.PRRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/prs")
public class PRController {

    private final PRRepository prRepository;

    public PRController(PRRepository prRepository) {
        this.prRepository = prRepository;
    }

    @GetMapping
    public ResponseEntity<List<PR>> getUserPRs(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(prRepository.findAllByUser(user));
    }
}
