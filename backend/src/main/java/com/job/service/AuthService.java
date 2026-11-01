package com.job.service;

import com.job.dto.AuthResponse;
import com.job.dto.LoginRequest;
import com.job.dto.MeResponse;
import com.job.dto.MessageResponse;
import com.job.dto.RegisterRequest;

public interface AuthService {
    MessageResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    MeResponse getMe(String email);
}
