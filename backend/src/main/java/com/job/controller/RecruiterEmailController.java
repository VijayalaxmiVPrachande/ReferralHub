package com.job.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.job.dto.EmailDraftResponse;
import com.job.dto.ReferralEmailResponse;
import com.job.dto.SendEmailRequest;
import com.job.enums.EmailType;
import com.job.service.RecruiterEmailService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/referrals/{id}")
@PreAuthorize("hasRole('RECRUITER')")
@RequiredArgsConstructor
public class RecruiterEmailController {

    private final RecruiterEmailService recruiterEmailService;

    @GetMapping("/email-draft")
    public EmailDraftResponse getDraft(
            @PathVariable Long id,
            @RequestParam(defaultValue = "NEXT_ROUND") EmailType type,
            Principal principal) {
        return recruiterEmailService.getDraft(id, type, principal.getName());
    }

    @PostMapping("/emails")
    public ReferralEmailResponse sendEmail(
            @PathVariable Long id,
            @Valid @RequestBody SendEmailRequest req,
            Principal principal) {
        return recruiterEmailService.sendEmail(id, req, principal.getName());
    }

    @GetMapping("/emails")
    public List<ReferralEmailResponse> getEmailHistory(
            @PathVariable Long id,
            Principal principal) {
        return recruiterEmailService.getEmailHistory(id, principal.getName());
    }
}
