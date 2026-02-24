package com.bodimkarayo.backend.dto;

import com.bodimkarayo.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private User user;
    private String token;
}
