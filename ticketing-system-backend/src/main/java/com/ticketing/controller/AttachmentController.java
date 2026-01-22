package com.ticketing.controller;

import com.ticketing.dto.AttachmentResponse;
import com.ticketing.service.AttachmentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @GetMapping
    public ResponseEntity<List<AttachmentResponse>> list(@PathVariable Long ticketId, Authentication authentication) {
        return ResponseEntity.ok(attachmentService.listAttachments(ticketId, authentication.getName()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<AttachmentResponse>> upload(
            @PathVariable Long ticketId,
            @RequestParam("files") List<MultipartFile> files,
            Authentication authentication
    ) {
        return ResponseEntity.ok(attachmentService.uploadAttachments(ticketId, files, authentication.getName()));
    }

    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<org.springframework.core.io.Resource> download(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId,
            Authentication authentication
    ) {
        AttachmentService.AttachmentDownload dl =
                attachmentService.downloadAttachment(ticketId, attachmentId, authentication.getName());

        String contentType = dl.getAttachment().getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        String filename = dl.getAttachment().getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            filename = "attachment";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename.replace("\"", "") + "\"")
                .body(dl.getResource());
    }
}

