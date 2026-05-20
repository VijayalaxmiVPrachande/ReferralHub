package com.job.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.job.dto.AuthRequest;
import com.job.dto.AuthResponse;
import com.job.entity.User;
import com.job.service.AuthService;
import com.job.util.JwtUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
	
    private final AuthService service;

    private final JwtUtil jwt;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid User user) {
        return ResponseEntity.ok(service.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthRequest req) {
        return ResponseEntity.ok(service.login(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestParam String token) {
        String email = jwt.extractEmail(token);
        return ResponseEntity.ok(
            new AuthResponse(jwt.generate(email),null)
        );
    }
}