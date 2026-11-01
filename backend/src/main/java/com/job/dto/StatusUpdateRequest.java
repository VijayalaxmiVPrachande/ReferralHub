package com.job.dto;

import com.job.enums.Status;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Status is required")
        Status status
) {}
