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
        private final EmailService emailService;

        public AuthService(UserRepository repository, PasswordEncoder passwordEncoder,
                        JwtService jwtService, AuthenticationManager authenticationManager, EmailService emailService) {
                this.repository = repository;
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
                this.authenticationManager = authenticationManager;
                this.emailService = emailService;
        }

        public AuthResponse register(RegisterRequest request) {
                if (repository.findByUsernameIgnoreCase(request.getUsername()).isPresent()) {
                        throw new RuntimeException("Username already exists");
                }
                String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
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
                user.setOtpCode(otp);
                user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
                repository.save(user);
                emailService.sendVerificationEmail(user.getEmail(), otp);
                return AuthResponse.builder()
                                .message("Please check your email to verify your account.")
                                .build();
        }

        public AuthResponse authenticate(AuthRequest request) {
                var user = repository.findByUsernameIgnoreCase(request.getUsername())
                                .orElseThrow();
                if (!user.isEmailVerified()) {
                        throw new org.springframework.security.authentication.BadCredentialsException(
                                        "Email not verified. Please check your inbox.");
                }
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));
                var jwtToken = jwtService.generateToken(user);
                return AuthResponse.builder()
                                .token(jwtToken)
                                .build();
        }

        public boolean verifyOtp(String email, String otp) {
                var user = repository.findAll().stream().filter(u -> email.equalsIgnoreCase(u.getEmail())).findFirst()
                                .orElse(null);
                if (user != null && otp.equals(user.getOtpCode())) {
                        if (user.getOtpExpiry() != null
                                        && java.time.LocalDateTime.now().isBefore(user.getOtpExpiry())) {
                                user.setEmailVerified(true);
                                user.setOtpCode(null);
                                user.setOtpExpiry(null);
                                repository.save(user);
                                return true;
                        }
                }
                return false;
        }
}
