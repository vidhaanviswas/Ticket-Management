package com.ticketing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommentRequest {
    @NotNull
    private Long ticketId;
    
    @NotBlank
    private String content;
}
