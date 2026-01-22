package com.ticketing.service;

import com.ticketing.dto.TicketRatingRequest;
import com.ticketing.dto.TicketRatingResponse;
import com.ticketing.model.Ticket;
import com.ticketing.model.TicketRating;
import com.ticketing.model.User;
import com.ticketing.repository.TicketRatingRepository;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;

@Service
public class TicketRatingService {
    private final TicketRatingRepository ticketRatingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketService ticketService;

    public TicketRatingService(
            TicketRatingRepository ticketRatingRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository,
            TicketService ticketService
    ) {
        this.ticketRatingRepository = ticketRatingRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketService = ticketService;
    }

    public TicketRatingResponse getRating(Long ticketId, String username) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Anyone who can view the ticket can view the rating
        ticketService.assertCanViewTicket(ticket, currentUser);

        TicketRating rating = ticketRatingRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not found"));
        return toResponse(rating);
    }

    @Transactional
    public TicketRatingResponse upsertRating(Long ticketId, TicketRatingRequest request, String username) {
        if (request.getStars() == null || request.getStars() < 1 || request.getStars() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stars must be between 1 and 5");
        }

        String feedback = request.getFeedback();
        if (feedback != null && feedback.length() > 2000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Feedback is too long (max 2000 characters)");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only regular USER who created the ticket can rate it
        if (!currentUser.getRole().equals(User.Role.USER) ||
                ticket.getCreatedBy() == null ||
                !Objects.equals(ticket.getCreatedBy().getId(), currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to rate this ticket");
        }

        if (ticket.getStatus() != Ticket.Status.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can rate a ticket only after it is closed");
        }

        TicketRating existing = ticketRatingRepository.findByTicketId(ticketId).orElse(null);
        if (existing != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Rating has already been submitted and cannot be updated");
        }

        TicketRating rating = new TicketRating();
        rating.setTicket(ticket);
        rating.setRatedBy(currentUser);
        rating.setStars(request.getStars());
        rating.setFeedback(feedback == null ? null : feedback.trim());

        rating = ticketRatingRepository.save(rating);
        return toResponse(rating);
    }

    private TicketRatingResponse toResponse(TicketRating rating) {
        TicketRatingResponse r = new TicketRatingResponse();
        r.setId(rating.getId());
        r.setStars(rating.getStars());
        r.setFeedback(rating.getFeedback());
        r.setRatedByUsername(rating.getRatedBy() != null ? rating.getRatedBy().getUsername() : null);
        r.setCreatedAt(rating.getCreatedAt());
        r.setUpdatedAt(rating.getUpdatedAt());
        return r;
    }
}

