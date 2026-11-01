package com.job.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.job.dto.AuthRequest;
import com.job.dto.AuthResponse;
import com.job.entity.User;
import com.job.repository.UserRepository;
import com.job.service.AuthService;
import com.job.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository repo;
    private final JwtUtil jwt;
    private final PasswordEncoder encoder;

    public String register(User user) {

        user.setPassword(encoder.encode(user.getPassword()));
        repo.save(user);
        return "Registered";
    }

    public AuthResponse login(AuthRequest req) {

        User user = repo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(req.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid password");

        return new AuthResponse(jwt.generate(user.getEmail()), user.getRole().name()); // ✅ include role

    }

}