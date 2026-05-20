package com.job.service;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.job.dto.ReferralRequest;
import com.job.entity.Referral;
import com.job.enums.Status;

public interface ReferralService {
    ResponseEntity<?> create(ReferralRequest req, MultipartFile resume, String email);
    Page<Referral> getAll(int page, int size, String email);
    Referral getOne(Long id);
    ResponseEntity<?> updateStatus(Long id, Status status);
    ResponseEntity<?> downloadResume(Long id);
}