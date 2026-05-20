package com.job.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CandidateDTO {

    @NotBlank
    private String name;

    @Email @NotBlank
    private String email;

    @Pattern(regexp = "^[0-9]{10}$")
    private String phone;
}
