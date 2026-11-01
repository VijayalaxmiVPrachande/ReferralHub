package com.job.dto;

public record JobResponse(
        Long id,
        String title,
        String description,
        String location
) {}
