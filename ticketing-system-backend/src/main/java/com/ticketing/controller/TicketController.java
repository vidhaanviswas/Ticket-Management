package com.ticketing.controller;

import com.ticketing.dto.TicketRequest;
import com.ticketing.dto.TicketResponse;
import com.ticketing.model.Ticket;
import com.ticketing.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    
    @Autowired
    private TicketService ticketService;
    
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody TicketRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.createTicket(request, authentication.getName()));
    }
    
    @GetMapping("/my-tickets")
    public ResponseEntity<List<TicketResponse>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getUserTickets(authentication.getName()));
    }
    
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getAllTicketsForUser(authentication.getName()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTicketByIdForUser(id, authentication.getName()));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request, authentication.getName()));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam Ticket.Status status,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, authentication.getName()));
    }
    
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long id,
            @RequestParam Long assignedToId,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.assignTicket(id, assignedToId, authentication.getName()));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<TicketResponse>> searchTickets(
            @RequestParam(required = false) Ticket.Status status,
            @RequestParam(required = false) Ticket.Priority priority,
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.searchTicketsForUser(status, priority, assignedToId, search, authentication.getName()));
    }
}
