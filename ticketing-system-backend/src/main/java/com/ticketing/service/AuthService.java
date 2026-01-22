package com.ticketing.service;

import com.ticketing.dto.AuthResponse;
import com.ticketing.dto.LoginRequest;
import com.ticketing.dto.RegisterRequest;
import com.ticketing.model.User;
import com.ticketing.repository.UserRepository;
import com.ticketing.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // SECURITY: Reject role assignment in public registration
        if (request.getRole() != null && request.getRole() != User.Role.USER) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Role assignment is not allowed during public registration. All users are registered as USER role. Only administrators can assign other roles."
            );
        }
        
        // Validate username and email
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        
        // Validate password strength (basic check)
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters long");
        }
        
        // Validate username format (alphanumeric and underscore only)
        if (!request.getUsername().matches("^[a-zA-Z0-9_]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username can only contain letters, numbers, and underscores");
        }
        
        // Validate username length
        if (request.getUsername().length() < 3 || request.getUsername().length() > 30) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username must be between 3 and 30 characters");
        }
        
        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // SECURITY: Always set role to USER for public registration
        // This prevents privilege escalation attacks
        // Only admins can create users with ADMIN/SUPPORT_AGENT roles via /api/admin/users endpoint
        user.setRole(User.Role.USER);
        
        user = userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getRole(), user.getId());
    }
    
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String token = jwtUtil.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getRole(), user.getId());
    }
}
