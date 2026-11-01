package com.job.dto;

import com.job.enums.EmailType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SendEmailRequest(
        @NotNull(message = "Email type is required")
        EmailType type,

        @NotBlank(message = "Subject is required")
        @Size(max = 150, message = "Subject must not exceed 150 characters")
        @Pattern(regexp = "^[^\\r\\n]*$", message = "Subject must not contain line breaks")
        String subject,

        @NotBlank(message = "Body is required")
        @Size(max = 5000, message = "Body must not exceed 5000 characters")
        String body,

        boolean ccMe,
        boolean notifyReferrer,
        boolean updateStatus
) {}
