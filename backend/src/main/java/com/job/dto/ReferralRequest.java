package com.job.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record ReferralRequest(
        @NotNull(message = "Job ID is required")
        Long jobId,

        @NotNull(message = "Candidate details are required")
        @Valid
        CandidateDTO candidate
) {}
