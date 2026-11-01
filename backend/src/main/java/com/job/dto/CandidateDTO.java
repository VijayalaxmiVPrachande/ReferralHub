package com.job.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CandidateDTO(
        @NotBlank(message = "Candidate name is required")
        String name,

        @NotBlank(message = "Candidate email is required")
        @Email(message = "Invalid candidate email format")
        String email,

        @Pattern(regexp = "^$|^[0-9+\\-\\s]{7,15}$", message = "Invalid phone number format")
        String phone
) {}
