package com.ticketing.service;

import com.ticketing.dto.AttachmentResponse;
import com.ticketing.model.Attachment;
import com.ticketing.model.Ticket;
import com.ticketing.model.User;
import com.ticketing.repository.AttachmentRepository;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    private final Path storageRoot;
    private final long maxBytes;
    private final Set<String> allowedContentTypes;

    public AttachmentService(
            AttachmentRepository attachmentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository,
            @Value("${app.attachments.storage-path:uploads}") String storagePath,
            @Value("${app.attachments.max-bytes:51200}") long maxBytes,
            @Value("${app.attachments.allowed-content-types:image/png,image/jpeg,image/webp,application/pdf}") String allowedTypes
    ) {
        this.attachmentRepository = attachmentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.storageRoot = Paths.get(storagePath).toAbsolutePath().normalize();
        this.maxBytes = maxBytes;
        this.allowedContentTypes = Arrays.stream(allowedTypes.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    public List<AttachmentResponse> listAttachments(Long ticketId, String username) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        assertCanAccessTicket(ticket, currentUser);

        return attachmentRepository.findByTicketIdOrderByUploadedAtDesc(ticketId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AttachmentResponse> uploadAttachments(Long ticketId, List<MultipartFile> files, String username) {
        if (files == null || files.isEmpty()) {
            throw new RuntimeException("No files provided");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If ticket is CLOSED, only ADMIN can upload attachments.
        if (ticket.getStatus() == Ticket.Status.CLOSED && !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket is closed. You can no longer upload attachments.");
        }

        // Upload permissions: creator, assigned user, support agent, or admin
        assertCanAccessTicket(ticket, currentUser);

        // Ensure storage root exists
        try {
            Files.createDirectories(storageRoot);
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize attachment storage", e);
        }

        Path ticketDir = storageRoot.resolve("tickets").resolve(ticketId.toString()).normalize();
        try {
            Files.createDirectories(ticketDir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create ticket attachment directory", e);
        }

        List<AttachmentResponse> responses = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            if (file.getSize() > maxBytes) {
                long maxKB = maxBytes / 1024;
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format("File size exceeds the demo limit of %d KB. This is a demonstration application with a %d KB file size limit.", maxKB, maxKB)
                );
            }

            String contentType = Optional.ofNullable(file.getContentType()).orElse("application/octet-stream");
            if (!allowedContentTypes.isEmpty() && !allowedContentTypes.contains(contentType)) {
                throw new RuntimeException("File type not allowed: " + contentType);
            }

            String original = sanitizeOriginalFilename(file.getOriginalFilename());
            String ext = safeExtensionFromFilename(original);
            String storedName = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);

            Path storedPath = ticketDir.resolve(storedName).normalize();
            if (!storedPath.startsWith(ticketDir)) {
                throw new RuntimeException("Invalid storage path");
            }

            try {
                Files.copy(file.getInputStream(), storedPath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store file", e);
            }

            Attachment attachment = new Attachment();
            attachment.setTicket(ticket);
            attachment.setUploadedBy(currentUser);
            attachment.setOriginalFilename(original);
            attachment.setContentType(contentType);
            attachment.setSizeBytes(file.getSize());
            attachment.setStoragePath(storageRoot.relativize(storedPath).toString().replace('\\', '/'));

            attachment = attachmentRepository.save(attachment);
            responses.add(toResponse(attachment));
        }

        return responses;
    }

    public AttachmentDownload downloadAttachment(Long ticketId, Long attachmentId, String username) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        assertCanAccessTicket(ticket, currentUser);

        Attachment attachment = attachmentRepository.findByIdAndTicketId(attachmentId, ticketId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        Path filePath = storageRoot.resolve(attachment.getStoragePath()).normalize();
        if (!filePath.startsWith(storageRoot)) {
            throw new RuntimeException("Invalid attachment path");
        }

        Resource resource;
        try {
            resource = new UrlResource(filePath.toUri());
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid attachment URL", e);
        }

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("Attachment file not found");
        }

        return new AttachmentDownload(attachment, resource);
    }

    private void assertCanAccessTicket(Ticket ticket, User currentUser) {
        if (currentUser.getRole().equals(User.Role.ADMIN)) {
            return;
        }
        if (currentUser.getRole().equals(User.Role.SUPPORT_AGENT)) {
            // Support agents can access tickets assigned to them (and tickets they created)
            if (ticket.getAssignedTo() != null && Objects.equals(ticket.getAssignedTo().getId(), currentUser.getId())) {
                return;
            }
            if (ticket.getCreatedBy() != null && Objects.equals(ticket.getCreatedBy().getId(), currentUser.getId())) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this ticket");
        }
        if (ticket.getCreatedBy() != null && Objects.equals(ticket.getCreatedBy().getId(), currentUser.getId())) {
            return;
        }
        if (ticket.getAssignedTo() != null && Objects.equals(ticket.getAssignedTo().getId(), currentUser.getId())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have permission to access this ticket");
    }

    private AttachmentResponse toResponse(Attachment attachment) {
        AttachmentResponse r = new AttachmentResponse();
        r.setId(attachment.getId());
        r.setOriginalFilename(attachment.getOriginalFilename());
        r.setContentType(attachment.getContentType());
        r.setSizeBytes(attachment.getSizeBytes());
        r.setUploadedAt(attachment.getUploadedAt());
        r.setUploadedByUsername(attachment.getUploadedBy() != null ? attachment.getUploadedBy().getUsername() : null);
        return r;
    }

    private String sanitizeOriginalFilename(String name) {
        if (name == null || name.isBlank()) return "file";
        // strip any path segments
        String base = Paths.get(name).getFileName().toString();
        // remove ASCII control characters (incl. null, CR, LF, tabs, etc.)
        // Use hex ranges to avoid invalid octal escapes in Java regex.
        base = base.replaceAll("[\\x00-\\x1F\\x7F]", "");
        // avoid absurdly long filenames
        if (base.length() > 200) {
            base = base.substring(base.length() - 200);
        }
        if (base.isBlank()) return "file";
        return base;
    }

    private String safeExtensionFromFilename(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf('.');
        if (idx < 0 || idx == filename.length() - 1) return "";
        String ext = filename.substring(idx + 1).toLowerCase(Locale.ROOT);
        // allow only simple extensions
        if (!ext.matches("[a-z0-9]{1,10}")) return "";
        return ext;
    }

    public static class AttachmentDownload {
        private final Attachment attachment;
        private final Resource resource;

        public AttachmentDownload(Attachment attachment, Resource resource) {
            this.attachment = attachment;
            this.resource = resource;
        }

        public Attachment getAttachment() {
            return attachment;
        }

        public Resource getResource() {
            return resource;
        }
    }
}

