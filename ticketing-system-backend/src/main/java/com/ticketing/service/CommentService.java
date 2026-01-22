package com.ticketing.service;

import com.ticketing.dto.CommentRequest;
import com.ticketing.dto.CommentResponse;
import com.ticketing.model.Comment;
import com.ticketing.model.Ticket;
import com.ticketing.model.User;
import com.ticketing.repository.CommentRepository;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public CommentResponse addComment(CommentRequest request, String username) {
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If ticket is CLOSED, only ADMIN can add comments.
        // (Users should use the rating/feedback feature; agents should close with final note beforehand.)
        if (ticket.getStatus() == Ticket.Status.CLOSED && !user.getRole().equals(User.Role.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket is closed. You can no longer add comments.");
        }
        
        // Permissions:
        // - ADMIN: can comment anywhere
        // - SUPPORT_AGENT: can comment on tickets assigned to them (and tickets they created)
        // - USER: can comment ONLY on tickets they created
        if (user.getRole().equals(User.Role.ADMIN)) {
            // ok
        } else if (user.getRole().equals(User.Role.SUPPORT_AGENT)) {
            boolean assigned = ticket.getAssignedTo() != null && Objects.equals(ticket.getAssignedTo().getId(), user.getId());
            boolean created = ticket.getCreatedBy() != null && Objects.equals(ticket.getCreatedBy().getId(), user.getId());
            if (!assigned && !created) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to comment on this ticket");
            }
        } else {
            if (ticket.getCreatedBy() == null || !Objects.equals(ticket.getCreatedBy().getId(), user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to comment on this ticket");
            }
        }
        
        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setTicket(ticket);
        comment.setUser(user);
        
        comment = commentRepository.save(comment);
        return convertToResponse(comment);
    }
    
    public List<CommentResponse> getTicketComments(Long ticketId, String username) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Same visibility rules as above
        if (currentUser.getRole().equals(User.Role.ADMIN)) {
            // ok
        } else if (currentUser.getRole().equals(User.Role.SUPPORT_AGENT)) {
            boolean assigned = ticket.getAssignedTo() != null && Objects.equals(ticket.getAssignedTo().getId(), currentUser.getId());
            boolean created = ticket.getCreatedBy() != null && Objects.equals(ticket.getCreatedBy().getId(), currentUser.getId());
            if (!assigned && !created) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to view comments for this ticket");
            }
        } else {
            if (ticket.getCreatedBy() == null || !Objects.equals(ticket.getCreatedBy().getId(), currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to view comments for this ticket");
            }
        }
        
        return commentRepository.findByTicketOrderByCreatedAtAsc(ticket).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    private CommentResponse convertToResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setTicketId(comment.getTicket().getId());
        response.setUserId(comment.getUser().getId());
        response.setUsername(comment.getUser().getUsername());
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }
}
