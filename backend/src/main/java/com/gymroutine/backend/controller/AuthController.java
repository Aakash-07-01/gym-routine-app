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
    public ResponseEntity<AuthResponse> authenticate(
            @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<java.util.Map<String, String>> verifyOtp(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        boolean success = authService.verifyOtp(email, otp);
        if (success) {
            return ResponseEntity.ok(java.util.Map.of("message", "Email verified successfully! You can now log in."));
        } else {
            return ResponseEntity.status(400)
                    .body(java.util.Map.of("message", "Invalid or expired OTP."));
        }
    }

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<java.util.Map<String, String>> handleBadCredentials(
            org.springframework.security.authentication.BadCredentialsException ex) {
        return ResponseEntity.status(401).body(java.util.Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<java.util.Map<String, String>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(400).body(java.util.Map.of("message", ex.getMessage()));
    }
}
