package com.ticketing.controller;

import com.ticketing.dto.TicketRatingRequest;
import com.ticketing.dto.TicketRatingResponse;
import com.ticketing.service.TicketRatingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets/{ticketId}/rating")
public class TicketRatingController {

    private final TicketRatingService ticketRatingService;

    public TicketRatingController(TicketRatingService ticketRatingService) {
        this.ticketRatingService = ticketRatingService;
    }

    @GetMapping
    public ResponseEntity<TicketRatingResponse> getRating(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketRatingService.getRating(ticketId, authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<TicketRatingResponse> rate(
            @PathVariable Long ticketId,
            @Valid @RequestBody TicketRatingRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketRatingService.upsertRating(ticketId, request, authentication.getName()));
    }
}

