package com.ticketing.controller;

import com.ticketing.dto.UserResponse;
import com.ticketing.model.User;
import com.ticketing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole()));
    }
    
    @GetMapping("/support-agents")
    public ResponseEntity<java.util.List<UserResponse>> getSupportAgents() {
        java.util.List<User> agents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.SUPPORT_AGENT || u.getRole() == User.Role.ADMIN)
                .toList();
        return ResponseEntity.ok(agents.stream()
                .map(u -> new UserResponse(u.getId(), u.getUsername(), u.getEmail(), u.getRole()))
                .toList());
    }
}
