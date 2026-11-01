package com.job.dto;

public record EmailDraftResponse(
        String to,
        String subject,
        String body
) {}
