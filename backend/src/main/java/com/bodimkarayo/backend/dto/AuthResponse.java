package com.bodimkarayo.backend.dto;

import com.bodimkarayo.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private User user;
    private String token;
    private String refreshToken;

    public AuthResponse(User user, String token) {
        this.user = user;
        this.token = token;
    }
}
