package com.job.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ReferralStatsResponse(
        @JsonProperty("REFERRED")
        long REFERRED,

        @JsonProperty("IN_REVIEW")
        long IN_REVIEW,

        @JsonProperty("NEXT_ROUND")
        long NEXT_ROUND,

        @JsonProperty("SELECTED")
        long SELECTED,

        @JsonProperty("REJECTED")
        long REJECTED,

        long total
) {}
