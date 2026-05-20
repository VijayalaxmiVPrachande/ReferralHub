package com.job.service;

import com.job.dto.AuthRequest;
import com.job.dto.AuthResponse;
import com.job.entity.User;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    String register(User user);
}
