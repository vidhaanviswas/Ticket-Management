package com.ticketing.dto;

import com.ticketing.model.Ticket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequest {
    @NotBlank
    private String subject;
    
    @NotBlank
    private String description;
    
    @NotNull
    private Ticket.Priority priority;
    
    private Long assignedToId;
}
