package com.job.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.job.dto.AuthResponse;
import com.job.dto.LoginRequest;
import com.job.dto.MeResponse;
import com.job.dto.MessageResponse;
import com.job.dto.RegisterRequest;
import com.job.entity.User;
import com.job.enums.Role;
import com.job.exception.ConflictException;
import com.job.exception.NotFoundException;
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

    @Value("${app.recruiter.invite-code:RECRUITER2026}")
    private String recruiterInviteCode;

    @Override
    public MessageResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();

        if (repo.existsByEmail(email)) {
            throw new ConflictException("Email is already registered: " + email);
        }

        boolean isRecruiter = req.inviteCode() != null 
                && !req.inviteCode().isBlank() 
                && recruiterInviteCode != null 
                && req.inviteCode().trim().equals(recruiterInviteCode.trim());

        Role role = isRecruiter ? Role.RECRUITER : Role.EMPLOYEE;

        User user = User.builder()
                .name(req.name().trim())
                .email(email)
                .password(encoder.encode(req.password()))
                .role(role)
                .build();

        repo.save(user);
        return new MessageResponse("User registered successfully");
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwt.generate(user.getEmail());
        return new AuthResponse(token, user.getRole().name(), user.getName(), user.getEmail());
    }

    @Override
    public MeResponse getMe(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = repo.findByEmail(normalizedEmail)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));

        return new MeResponse(user.getName(), user.getEmail(), user.getRole().name());
    }
}