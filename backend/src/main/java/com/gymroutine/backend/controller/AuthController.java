package com.gymroutine.backend.controller;

import com.gymroutine.backend.dto.AuthRequest;
import com.gymroutine.backend.dto.AuthResponse;
import com.gymroutine.backend.dto.RegisterRequest;
import com.gymroutine.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<com.gymroutine.backend.dto.AuthResponse> login(
            @RequestBody com.gymroutine.backend.dto.AuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<java.util.Map<String, String>> logout() {
        return ResponseEntity.ok(java.util.Map.of("message", "Logged out"));
    }

}
