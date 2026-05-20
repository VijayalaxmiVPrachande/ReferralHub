package com.job.controller;

import java.security.Principal;

import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.job.dto.ReferralRequest;
import com.job.entity.Referral;
import com.job.enums.Status;
import com.job.service.ReferralService;

import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
@RestController
@RequestMapping("/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService service;

    // Employee: submit referral with resume


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(
            @RequestPart("data") @Valid ReferralRequest req,
            @RequestPart("resume") MultipartFile resume,
            Principal principal) {
        return service.create(req, resume, principal.getName());
    }

    // Both roles: list referrals (paginated)
    @GetMapping
    public ResponseEntity<Page<Referral>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        return ResponseEntity.ok(service.getAll(page, size, principal.getName()));
    }

    // Recruiter: get single referral detail
    @GetMapping("/{id}")
    public ResponseEntity<Referral> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.getOne(id));
    }

    // Recruiter: update status → triggers email to candidate
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam Status status) {
        return service.updateStatus(id, status);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadResume(@PathVariable Long id) {
        return service.downloadResume(id);
    }
}