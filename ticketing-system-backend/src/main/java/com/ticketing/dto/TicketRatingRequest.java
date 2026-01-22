package com.ticketing.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class TicketRatingRequest {
    @Min(1)
    @Max(5)
    private Integer stars;

    private String feedback;
}

