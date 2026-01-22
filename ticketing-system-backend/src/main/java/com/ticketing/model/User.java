package com.ticketing.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL)
    private Set<Ticket> createdTickets;
    
    @OneToMany(mappedBy = "assignedTo", cascade = CascadeType.ALL)
    private Set<Ticket> assignedTickets;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<Comment> comments;
    
    public enum Role {
        USER, ADMIN, SUPPORT_AGENT
    }
}
