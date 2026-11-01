package com.job.util;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretString;

    @Value("${jwt.expiration-ms:86400000}")
    private long expirationMs;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        if (secretString == null || secretString.trim().length() < 32) {
            throw new IllegalStateException("jwt.secret must be at least 32 characters long");
        }
        this.secretKey = Keys.hmacShaKeyFor(secretString.trim().getBytes(StandardCharsets.UTF_8));
    }

    public String generate(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Returns the email (subject) from a valid token.
     * Throws RuntimeException for invalid/expired tokens —
     * the caller (JwtFilter) is responsible for catching it.
     */
    public String extractEmail(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired token", e);
        }
    }
}