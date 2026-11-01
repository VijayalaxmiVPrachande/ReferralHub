package com.job.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.job.dto.EmailDraftResponse;
import com.job.dto.ReferralEmailResponse;
import com.job.dto.SendEmailRequest;
import com.job.entity.Referral;
import com.job.entity.ReferralEmail;
import com.job.entity.User;
import com.job.enums.EmailDeliveryStatus;
import com.job.enums.EmailType;
import com.job.enums.Role;
import com.job.enums.Status;
import com.job.exception.BadGatewayException;
import com.job.exception.ForbiddenException;
import com.job.exception.NotFoundException;
import com.job.repository.ReferralEmailRepository;
import com.job.repository.ReferralRepository;
import com.job.repository.UserRepository;
import com.job.service.EmailService;
import com.job.service.RecruiterEmailService;
import com.job.util.EmailTemplates;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecruiterEmailServiceImpl implements RecruiterEmailService {

    private final ReferralRepository referralRepository;
    private final UserRepository userRepository;
    private final ReferralEmailRepository referralEmailRepository;
    private final EmailService emailService;

    @Value("${app.company.name:ReferralHub}")
    private String companyName;

    @Override
    @Transactional(readOnly = true)
    public EmailDraftResponse getDraft(Long referralId, EmailType type, String recruiterEmail) {
        User recruiter = getRecruiterUser(recruiterEmail);
        Referral referral = getReferral(referralId);

        EmailType emailType = (type != null) ? type : EmailType.NEXT_ROUND;

        String candidateName = (referral.getCandidate() != null) ? referral.getCandidate().getName() : "";
        String candidateEmail = (referral.getCandidate() != null) ? referral.getCandidate().getEmail() : "";
        String jobTitle = (referral.getJob() != null) ? referral.getJob().getTitle() : "";

        return EmailTemplates.createDraft(
                emailType,
                candidateName,
                candidateEmail,
                jobTitle,
                recruiter.getName(),
                companyName
        );
    }

    @Override
    public ReferralEmailResponse sendEmail(Long referralId, SendEmailRequest req, String recruiterEmail) {
        User recruiter = getRecruiterUser(recruiterEmail);
        Referral referral = getReferral(referralId);

        String candidateEmail = (referral.getCandidate() != null) ? referral.getCandidate().getEmail() : null;
        if (candidateEmail == null || candidateEmail.isBlank()) {
            throw new NotFoundException("Candidate email not found for referral id: " + referralId);
        }

        List<String> ccList = new ArrayList<>();
        if (req.ccMe()) {
            ccList.add(recruiter.getEmail());
        }
        if (req.notifyReferrer() && referral.getEmployee() != null && referral.getEmployee().getEmail() != null) {
            ccList.add(referral.getEmployee().getEmail());
        }
        String[] ccArray = ccList.toArray(new String[0]);

        LocalDateTime now = LocalDateTime.now();

        try {
            // Attempt delivery
            emailService.sendMail(candidateEmail, req.subject(), req.body(), ccArray);

            // Record successful email
            ReferralEmail record = ReferralEmail.builder()
                    .referral(referral)
                    .sentBy(recruiter)
                    .type(req.type())
                    .toEmail(candidateEmail)
                    .subject(req.subject())
                    .body(req.body())
                    .status(EmailDeliveryStatus.SENT)
                    .errorMessage(null)
                    .sentAt(now)
                    .build();
            record = referralEmailRepository.save(record);

            // Update referral lastEmailAt
            referral.setLastEmailAt(now);

            // If updateStatus is requested, transition status matching the type
            if (req.updateStatus()) {
                switch (req.type()) {
                    case NEXT_ROUND -> referral.setStatus(Status.NEXT_ROUND);
                    case SELECTED -> referral.setStatus(Status.SELECTED);
                    case REJECTED -> referral.setStatus(Status.REJECTED);
                    case CUSTOM -> { /* Leave status unchanged */ }
                }
            }
            referralRepository.save(referral);

            log.info("Candidate outreach email sent successfully for referral id: {}", referralId);
            return toResponse(record);

        } catch (Exception e) {
            log.error("Failed to send outreach email to {} for referral id {}: {}", candidateEmail, referralId, e.getMessage());

            // Save failed record for audit history
            try {
                ReferralEmail failedRecord = ReferralEmail.builder()
                        .referral(referral)
                        .sentBy(recruiter)
                        .type(req.type())
                        .toEmail(candidateEmail)
                        .subject(req.subject())
                        .body(req.body())
                        .status(EmailDeliveryStatus.FAILED)
                        .errorMessage(e.getMessage())
                        .sentAt(now)
                        .build();
                referralEmailRepository.save(failedRecord);
            } catch (Exception recordErr) {
                log.error("Failed to persist failed ReferralEmail record: {}", recordErr.getMessage());
            }

            throw new BadGatewayException("Failed to deliver email: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReferralEmailResponse> getEmailHistory(Long referralId, String recruiterEmail) {
        getRecruiterUser(recruiterEmail);
        getReferral(referralId);

        List<ReferralEmail> emails = referralEmailRepository.findByReferralIdOrderBySentAtDesc(referralId);
        return emails.stream().map(this::toResponse).toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private User getRecruiterUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getRole() != Role.RECRUITER) {
            throw new ForbiddenException("Access denied: only recruiters can manage candidate emails");
        }
        return user;
    }

    private Referral getReferral(Long id) {
        return referralRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Referral not found with id: " + id));
    }

    private ReferralEmailResponse toResponse(ReferralEmail email) {
        ReferralEmailResponse.SentBySummary sentBySummary = (email.getSentBy() != null)
                ? new ReferralEmailResponse.SentBySummary(email.getSentBy().getName(), email.getSentBy().getEmail())
                : null;

        return new ReferralEmailResponse(
                email.getId(),
                email.getType(),
                email.getToEmail(),
                email.getSubject(),
                email.getBody(),
                email.getStatus(),
                email.getErrorMessage(),
                email.getSentAt(),
                sentBySummary
        );
    }
}
