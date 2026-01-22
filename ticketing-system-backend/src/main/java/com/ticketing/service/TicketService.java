package com.ticketing.service;

import com.ticketing.dto.TicketRequest;
import com.ticketing.dto.TicketResponse;
import com.ticketing.model.Ticket;
import com.ticketing.model.User;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Transactional
    public TicketResponse createTicket(TicketRequest request, String username) {
        User createdBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Business rule: USER can have only one active (non-closed) ticket at a time.
        if (createdBy.getRole().equals(User.Role.USER) &&
                ticketRepository.existsByCreatedByAndStatusNot(createdBy, Ticket.Status.CLOSED)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You already have an active ticket. Please close it before creating a new one."
            );
        }
        
        Ticket ticket = new Ticket();
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(Ticket.Status.OPEN);
        ticket.setCreatedBy(createdBy);
        
        if (request.getAssignedToId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            ticket.setAssignedTo(assignedTo);
        }
        
        ticket = ticketRepository.save(ticket);
        return convertToResponse(ticket);
    }
    
    public List<TicketResponse> getUserTickets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ticketRepository.findByCreatedBy(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return convertToResponse(ticket);
    }

    /**
     * Ticket visibility rules:
     * - ADMIN: can view all tickets
     * - SUPPORT_AGENT: can view tickets assigned to them (and tickets they created)
     * - USER: can view ONLY tickets they created
     */
    public List<TicketResponse> getAllTicketsForUser(String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole().equals(User.Role.ADMIN)) {
            return getAllTickets();
        }
        if (currentUser.getRole().equals(User.Role.SUPPORT_AGENT)) {
            Map<Long, Ticket> unique = new LinkedHashMap<>();
            ticketRepository.findByAssignedTo(currentUser).forEach(t -> unique.put(t.getId(), t));
            ticketRepository.findByCreatedBy(currentUser).forEach(t -> unique.put(t.getId(), t));
            return unique.values().stream().map(this::convertToResponse).collect(Collectors.toList());
        }

        // Regular users should not call this endpoint; they use /my-tickets
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to view all tickets");
    }

    public TicketResponse getTicketByIdForUser(Long id, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        assertCanViewTicket(ticket, currentUser);
        return convertToResponse(ticket);
    }
    
    @Transactional
    public TicketResponse updateTicket(Long id, TicketRequest request, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check permissions
        if (!currentUser.getRole().equals(User.Role.ADMIN) && 
            !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to update this ticket");
        }
        
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        
        if (request.getAssignedToId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            ticket.setAssignedTo(assignedTo);
        }
        
        ticket = ticketRepository.save(ticket);
        return convertToResponse(ticket);
    }
    
    @Transactional
    public TicketResponse updateTicketStatus(Long id, Ticket.Status status, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only ADMIN or the SUPPORT_AGENT assigned to this ticket can change status
        if (currentUser.getRole().equals(User.Role.ADMIN)) {
            // ok
        } else if (currentUser.getRole().equals(User.Role.SUPPORT_AGENT)) {
            if (ticket.getAssignedTo() == null || !Objects.equals(ticket.getAssignedTo().getId(), currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to change ticket status");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to change ticket status");
        }
        
        ticket.setStatus(status);
        ticket = ticketRepository.save(ticket);
        return convertToResponse(ticket);
    }
    
    @Transactional
    public TicketResponse assignTicket(Long id, Long assignedToId, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only ADMIN can assign tickets
        if (!currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to assign tickets");
        }
        
        User assignedTo = userRepository.findById(assignedToId)
                .orElseThrow(() -> new RuntimeException("Assigned user not found"));
        
        ticket.setAssignedTo(assignedTo);
        ticket = ticketRepository.save(ticket);
        return convertToResponse(ticket);
    }
    
    public List<TicketResponse> searchTickets(Ticket.Status status, Ticket.Priority priority, 
                                               Long assignedToId, String search) {
        return ticketRepository.searchTickets(status, priority, assignedToId, search).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> searchTicketsForUser(
            Ticket.Status status,
            Ticket.Priority priority,
            Long assignedToId,
            String search,
            String username
    ) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole().equals(User.Role.ADMIN)) {
            return searchTickets(status, priority, assignedToId, search);
        }

        if (currentUser.getRole().equals(User.Role.SUPPORT_AGENT)) {
            // Support agents can search within tickets assigned to them and tickets they created
            String q = (search == null || search.isBlank()) ? null : search.toLowerCase();
            Map<Long, Ticket> unique = new LinkedHashMap<>();
            ticketRepository.findByAssignedTo(currentUser).forEach(t -> unique.put(t.getId(), t));
            ticketRepository.findByCreatedBy(currentUser).forEach(t -> unique.put(t.getId(), t));

            return unique.values().stream()
                    .filter(t -> status == null || t.getStatus() == status)
                    .filter(t -> priority == null || t.getPriority() == priority)
                    .filter(t -> assignedToId == null || (t.getAssignedTo() != null && Objects.equals(t.getAssignedTo().getId(), assignedToId)))
                    .filter(t -> q == null ||
                            (t.getSubject() != null && t.getSubject().toLowerCase().contains(q)) ||
                            (t.getDescription() != null && t.getDescription().toLowerCase().contains(q)))
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to search tickets");
    }

    public void assertCanViewTicket(Ticket ticket, User currentUser) {
        if (currentUser.getRole().equals(User.Role.ADMIN)) {
            return;
        }
        if (currentUser.getRole().equals(User.Role.SUPPORT_AGENT)) {
            if (ticket.getAssignedTo() != null && Objects.equals(ticket.getAssignedTo().getId(), currentUser.getId())) {
                return;
            }
            // Allow agents to view tickets they personally created
            if (ticket.getCreatedBy() != null && Objects.equals(ticket.getCreatedBy().getId(), currentUser.getId())) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this ticket");
        }
        // USER
        if (ticket.getCreatedBy() != null && Objects.equals(ticket.getCreatedBy().getId(), currentUser.getId())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this ticket");
    }
    
    private TicketResponse convertToResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setSubject(ticket.getSubject());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setCreatedById(ticket.getCreatedBy().getId());
        response.setCreatedByUsername(ticket.getCreatedBy().getUsername());
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        
        if (ticket.getAssignedTo() != null) {
            response.setAssignedToId(ticket.getAssignedTo().getId());
            response.setAssignedToUsername(ticket.getAssignedTo().getUsername());
        }
        
        return response;
    }
}
