package com.job.dto;

public record AuthResponse(
        String accessToken,
        String role,
        String name,
        String email
) {}
