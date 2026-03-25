package com.gymroutine.backend.service;

import com.gymroutine.backend.config.JwtService;
import com.gymroutine.backend.dto.AuthRequest;
import com.gymroutine.backend.dto.AuthResponse;
import com.gymroutine.backend.dto.RegisterRequest;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

        private final UserRepository repository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthService(UserRepository repository, PasswordEncoder passwordEncoder,
                        JwtService jwtService, AuthenticationManager authenticationManager) {
                this.repository = repository;
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
                this.authenticationManager = authenticationManager;
        }

        public AuthResponse register(RegisterRequest request) {
                if (repository.findByUsername(request.getUsername()).isPresent()) {
                        throw new RuntimeException("Username already exists");
                }
                var user = User.builder()
                                .username(request.getUsername())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .build();
                repository.save(user);
                var jwtToken = jwtService.generateToken(user);
                return AuthResponse.builder()
                                .token(jwtToken)
                                .build();
        }

        public AuthResponse authenticate(AuthRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));
                var user = repository.findByUsername(request.getUsername())
                                .orElseThrow();
                var jwtToken = jwtService.generateToken(user);
                return AuthResponse.builder()
                                .token(jwtToken)
                                .build();
        }
}
