package com.ticketing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String content;
    private Long ticketId;
    private Long userId;
    private String username;
    private LocalDateTime createdAt;
}
