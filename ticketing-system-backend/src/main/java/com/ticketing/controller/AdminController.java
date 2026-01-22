package com.ticketing.controller;

import com.ticketing.dto.RegisterRequest;
import com.ticketing.dto.TicketResponse;
import com.ticketing.dto.UserResponse;
import com.ticketing.model.Ticket;
import com.ticketing.service.TicketService;
import com.ticketing.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private TicketService ticketService;
    
    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    
    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    // Ticket Management
    @GetMapping("/tickets")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }
    
    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<TicketResponse> forceUpdateStatus(
            @PathVariable Long id,
            @RequestParam Ticket.Status status,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, authentication.getName()));
    }
    
    @PutMapping("/tickets/{id}/assign")
    public ResponseEntity<TicketResponse> forceAssign(
            @PathVariable Long id,
            @RequestParam Long assignedToId,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.assignTicket(id, assignedToId, authentication.getName()));
    }
}
