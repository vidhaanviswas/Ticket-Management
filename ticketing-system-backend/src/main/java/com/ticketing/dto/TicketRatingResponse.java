package com.ticketing.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketRatingResponse {
    private Long id;
    private Integer stars;
    private String feedback;
    private String ratedByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

