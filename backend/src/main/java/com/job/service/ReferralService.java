package com.job.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import com.job.dto.PagedResponse;
import com.job.dto.ReferralRequest;
import com.job.dto.ReferralResponse;
import com.job.dto.ReferralStatsResponse;
import com.job.enums.Status;

public interface ReferralService {
    ReferralResponse create(ReferralRequest req, MultipartFile resume, String email);
    PagedResponse<ReferralResponse> getAll(int page, int size, String sort, Status status, String q, String email);
    ReferralResponse getOne(Long id, String email);
    ReferralResponse updateStatus(Long id, Status status, String email);
    ReferralStatsResponse getStats(String email);
    Resource loadResume(Long id, String email);
    String getResumeFilename(Long id, String email);
}