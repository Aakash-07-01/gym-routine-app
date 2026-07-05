package com.gymroutine.backend.service;

import com.gymroutine.backend.dto.UpdateProfileRequest;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public User getProfile(String username) {
        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        if (request.getHeight() != null) {
            user.setHeight(request.getHeight());
        }
        if (request.getStartingWeight() != null) {
            user.setStartingWeight(request.getStartingWeight());
        }
        if (request.getCurrentWeight() != null) {
            user.setCurrentWeight(request.getCurrentWeight());
        }
        if (request.getPrimaryGoal() != null && !request.getPrimaryGoal().isBlank()) {
            user.setPrimaryGoal(request.getPrimaryGoal());
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteProfile(String username) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        userRepository.flush();
    }
}
