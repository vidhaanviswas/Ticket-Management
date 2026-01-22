package com.ticketing.controller;

import com.ticketing.dto.CommentRequest;
import com.ticketing.dto.CommentResponse;
import com.ticketing.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(commentService.addComment(request, authentication.getName()));
    }
    
    @GetMapping("/ticket/{ticketId}")
  public ResponseEntity<List<CommentResponse>> getTicketComments(@PathVariable Long ticketId, Authentication authentication) {
      return ResponseEntity.ok(commentService.getTicketComments(ticketId, authentication.getName()));
    }
}
