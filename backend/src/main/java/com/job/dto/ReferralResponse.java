package com.job.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.job.enums.Status;

public record ReferralResponse(
        Long id,
        Status status,
        LocalDateTime createdTime,
        Integer atsScore,
        String atsLabel,
        List<String> matchedSkills,
        List<String> missingSkills,
        JobSummary job,
        CandidateSummary candidate,
        @JsonInclude(JsonInclude.Include.ALWAYS)
        ReferrerSummary referredBy,
        boolean hasResume,
        @JsonInclude(JsonInclude.Include.ALWAYS)
        LocalDateTime lastEmailAt
) {
    public record JobSummary(Long id, String title) {}
    public record CandidateSummary(String name, String email, String phone) {}
    public record ReferrerSummary(String name, String email) {}
}
