package com.ticketing.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AttachmentResponse {
    private Long id;
    private String originalFilename;
    private String contentType;
    private Long sizeBytes;
    private LocalDateTime uploadedAt;
    private String uploadedByUsername;
}

