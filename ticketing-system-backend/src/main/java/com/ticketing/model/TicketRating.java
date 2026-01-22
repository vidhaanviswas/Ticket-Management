package com.ticketing.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_ratings", uniqueConstraints = {
        @UniqueConstraint(name = "uk_ticket_rating_ticket", columnNames = {"ticket_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rated_by", nullable = false)
    private User ratedBy;

    @Column(nullable = false)
    private Integer stars; // 1..5

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

