package com.gymroutine.backend.service;

import com.gymroutine.backend.config.JwtService;
import com.gymroutine.backend.dto.AuthRequest;
import com.gymroutine.backend.dto.AuthResponse;
import com.gymroutine.backend.dto.RegisterRequest;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.model.BodyMetricsLog;
import com.gymroutine.backend.repository.UserRepository;
import com.gymroutine.backend.repository.BodyMetricsLogRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

        private final UserRepository repository;
        private final BodyMetricsLogRepository bodyMetricsLogRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final EmailService emailService;

        public AuthService(UserRepository repository, BodyMetricsLogRepository bodyMetricsLogRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService, AuthenticationManager authenticationManager, EmailService emailService) {
                this.repository = repository;
                this.bodyMetricsLogRepository = bodyMetricsLogRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
                this.authenticationManager = authenticationManager;
                this.emailService = emailService;
        }

        public AuthResponse register(RegisterRequest request) {
                if (repository.findByUsernameIgnoreCase(request.getUsername()).isPresent()) {
                        throw new RuntimeException("Username already exists");
                }
                if (repository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already exists");
                }
                var user = User.builder()
                                .fullName(request.getFullName())
                                .username(request.getUsername())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .dob(request.getDob())
                                .biologicalSex(request.getBiologicalSex())
                                .height(request.getHeight())
                                .startingWeight(request.getStartingWeight())
                                .primaryGoal(request.getPrimaryGoal())
                                .experienceLevel(request.getExperienceLevel())
                                .unitPreference(request.getUnitPreference())
                                .build();
                user.setEmailVerified(true);
                repository.save(user);

                // Initialize starting weight into the metrics log
                if (user.getStartingWeight() != null) {
                        BodyMetricsLog initialLog = new BodyMetricsLog();
                        initialLog.setUser(user);
                        initialLog.setBodyWeight(user.getStartingWeight());
                        initialLog.setMeasurementMethod("Initial Registration");
                        initialLog.setDateLogged(java.time.LocalDateTime.now());
                        bodyMetricsLogRepository.save(initialLog);
                }

                return AuthResponse.builder()
                                .message("Registration successful. You can now log in.")
                                .build();
        }

        public AuthResponse authenticate(AuthRequest request) {
                var user = repository.findByUsernameIgnoreCase(request.getUsername())
                                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));
                var jwtToken = jwtService.generateToken(user);
                return AuthResponse.builder()
                                .token(jwtToken)
                                .build();
        }
}
