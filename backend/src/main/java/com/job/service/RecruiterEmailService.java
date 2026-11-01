package com.job.service;

import java.util.List;

import com.job.dto.EmailDraftResponse;
import com.job.dto.ReferralEmailResponse;
import com.job.dto.SendEmailRequest;
import com.job.enums.EmailType;

public interface RecruiterEmailService {
    EmailDraftResponse getDraft(Long referralId, EmailType type, String recruiterEmail);
    ReferralEmailResponse sendEmail(Long referralId, SendEmailRequest req, String recruiterEmail);
    List<ReferralEmailResponse> getEmailHistory(Long referralId, String recruiterEmail);
}
