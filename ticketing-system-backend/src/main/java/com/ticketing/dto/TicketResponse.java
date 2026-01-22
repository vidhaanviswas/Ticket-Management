package com.ticketing.dto;

import com.ticketing.model.Ticket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String subject;
    private String description;
    private Ticket.Priority priority;
    private Ticket.Status status;
    private Long createdById;
    private String createdByUsername;
    private Long assignedToId;
    private String assignedToUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
