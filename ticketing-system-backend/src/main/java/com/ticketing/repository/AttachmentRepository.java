package com.ticketing.repository;

import com.ticketing.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTicketIdOrderByUploadedAtDesc(Long ticketId);

    Optional<Attachment> findByIdAndTicketId(Long id, Long ticketId);
}

