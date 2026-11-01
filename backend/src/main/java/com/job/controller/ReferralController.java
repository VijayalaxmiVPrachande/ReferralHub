package com.job.controller;

import java.security.Principal;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.job.dto.PagedResponse;
import com.job.dto.ReferralRequest;
import com.job.dto.ReferralResponse;
import com.job.dto.ReferralStatsResponse;
import com.job.dto.StatusUpdateRequest;
import com.job.enums.Status;
import com.job.exception.BadRequestException;
import com.job.service.ReferralService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ReferralResponse create(
            @RequestPart("data") @Valid ReferralRequest req,
            @RequestPart("resume") MultipartFile resume,
            Principal principal) {
        return referralService.create(req, resume, principal.getName());
    }

    @GetMapping
    public PagedResponse<ReferralResponse> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) String q,
            Principal principal) {
        return referralService.getAll(page, size, sort, status, q, principal.getName());
    }

    @GetMapping("/stats")
    public ReferralStatsResponse getStats(Principal principal) {
        return referralService.getStats(principal.getName());
    }

    @GetMapping("/{id}")
    public ReferralResponse getOne(
            @PathVariable Long id,
            Principal principal) {
        return referralService.getOne(id, principal.getName());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ReferralResponse updateStatus(
            @PathVariable Long id,
            @RequestBody(required = false) StatusUpdateRequest body,
            @RequestParam(required = false) Status status,
            Principal principal) {
        Status targetStatus = null;
        if (body != null && body.status() != null) {
            targetStatus = body.status();
        } else if (status != null) {
            targetStatus = status;
        }

        if (targetStatus == null) {
            throw new BadRequestException("Status is required");
        }

        return referralService.updateStatus(id, targetStatus, principal.getName());
    }

    @GetMapping(value = {"/{id}/resume", "/{id}/download"})
    public ResponseEntity<Resource> getResume(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean download,
            Principal principal) {
        Resource resource = referralService.loadResume(id, principal.getName());
        String filename = referralService.getResumeFilename(id, principal.getName());

        String mediaType = "application/pdf";
        if (filename.toLowerCase().endsWith(".docx")) {
            mediaType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }

        String dispositionType = download ? "attachment" : "inline";
        String contentDisposition = dispositionType + "; filename=\"" + filename + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mediaType))
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .header("X-Content-Type-Options", "nosniff")
                .body(resource);
    }
}