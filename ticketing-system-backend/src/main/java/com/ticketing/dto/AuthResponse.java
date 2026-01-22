package com.ticketing.dto;

import com.ticketing.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private User.Role role;
    private Long userId;
}
