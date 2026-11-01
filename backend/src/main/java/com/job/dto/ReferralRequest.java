package com.job.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReferralRequest {

    @NotNull
    private Long jobId;

    @Valid
    private CandidateDTO candidate;
}
