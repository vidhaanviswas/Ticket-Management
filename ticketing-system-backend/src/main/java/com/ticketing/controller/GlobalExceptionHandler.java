package com.ticketing.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", ex.getStatusCode().value());
        body.put("error", ex.getStatusCode().toString());
        body.put("message", ex.getReason());
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    @ExceptionHandler({MaxUploadSizeExceededException.class, MultipartException.class})
    public ResponseEntity<Map<String, Object>> handleMaxUploadSizeExceeded(Exception ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", 400);
        body.put("error", "BAD_REQUEST");
        
        // Check if it's a size-related error
        String errorMessage = ex.getMessage();
        if (errorMessage != null && (errorMessage.contains("size") || errorMessage.contains("exceeded") || 
            errorMessage.contains("Maximum upload"))) {
            body.put("message", "File size exceeds the demo limit of 50 KB. This is a demonstration application with a 50 KB file size limit.");
        } else {
            body.put("message", "File upload error: Invalid file upload");
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        // SECURITY: Log full error for debugging but don't expose to client
        log.error("Internal error occurred", ex);
        
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        
        // Check if it's a known business exception with safe message
        String message = ex.getMessage();
        if (message != null && (
            message.contains("not found") || 
            message.contains("already exists") ||
            message.contains("permission") ||
            message.contains("Invalid") ||
            message.contains("required")
        )) {
            // Safe to return user-friendly messages for known business exceptions
            body.put("status", 400);
            body.put("error", "BAD_REQUEST");
            body.put("message", message);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }
        
        // For unknown exceptions, return generic error message
        body.put("status", 500);
        body.put("error", "INTERNAL_SERVER_ERROR");
        body.put("message", "An internal error occurred. Please try again later.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}

