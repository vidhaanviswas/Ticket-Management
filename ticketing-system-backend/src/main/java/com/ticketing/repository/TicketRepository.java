package com.ticketing.repository;

import com.ticketing.model.Ticket;
import com.ticketing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedBy(User user);
    List<Ticket> findByAssignedTo(User user);

    boolean existsByCreatedByAndStatusNot(User user, Ticket.Status status);
    
    @Query("SELECT t FROM Ticket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:assignedToId IS NULL OR t.assignedTo.id = :assignedToId) AND " +
           "(:search IS NULL OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Ticket> searchTickets(
        @Param("status") Ticket.Status status,
        @Param("priority") Ticket.Priority priority,
        @Param("assignedToId") Long assignedToId,
        @Param("search") String search
    );
}
