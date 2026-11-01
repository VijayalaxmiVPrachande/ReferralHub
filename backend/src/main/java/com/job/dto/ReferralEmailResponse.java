package com.job.dto;

import java.time.LocalDateTime;

import com.job.enums.EmailDeliveryStatus;
import com.job.enums.EmailType;

public record ReferralEmailResponse(
        Long id,
        EmailType type,
        String toEmail,
        String subject,
        String body,
        EmailDeliveryStatus status,
        String errorMessage,
        LocalDateTime sentAt,
        SentBySummary sentBy
) {
    public record SentBySummary(String name, String email) {}
}
