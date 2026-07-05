package com.gymroutine.backend.controller;

import com.gymroutine.backend.dto.UpdateProfileRequest;
import com.gymroutine.backend.model.User;
import com.gymroutine.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/profile")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<User> getProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getProfile(username);
        return ResponseEntity.ok(user);
    }

    @PatchMapping
    public ResponseEntity<User> updateProfile(Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        String username = authentication.getName();
        User updatedUser = userService.updateProfile(username, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteProfile(Authentication authentication) {
        String username = authentication.getName();
        userService.deleteProfile(username);
        return ResponseEntity.ok().build();
    }
}
