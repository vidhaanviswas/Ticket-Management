package com.ticketing.dto;

import com.ticketing.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String username;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    private String password;
    
    private User.Role role = User.Role.USER;
}
