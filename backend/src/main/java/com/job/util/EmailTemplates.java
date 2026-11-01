package com.job.util;

import com.job.dto.EmailDraftResponse;
import com.job.enums.EmailType;

public final class EmailTemplates {

    private EmailTemplates() {}

    public static EmailDraftResponse createDraft(
            EmailType type,
            String candidateName,
            String candidateEmail,
            String jobTitle,
            String recruiterName,
            String companyName
    ) {
        String safeCandidate = (candidateName != null && !candidateName.isBlank()) ? candidateName : "Candidate";
        String safeJob = (jobTitle != null && !jobTitle.isBlank()) ? jobTitle : "Position";
        String safeRecruiter = (recruiterName != null && !recruiterName.isBlank()) ? recruiterName : "Recruiter";
        String safeCompany = (companyName != null && !companyName.isBlank()) ? companyName : "ReferralHub";

        switch (type) {
            case NEXT_ROUND: {
                String subject = "Interview Invitation: " + safeJob + " at " + safeCompany;
                String body = "Hi " + safeCandidate + ",\n\n"
                        + "Thank you for your interest in the " + safeJob + " position at " + safeCompany + ". "
                        + "We were very impressed with your background and qualifications, and we would like to invite you to the next round of our hiring process.\n\n"
                        + "Interview Details:\n"
                        + "- Round: Technical Deep-Dive / Panel Interview\n"
                        + "- Date & Time: [Please specify date and time, e.g., Thursday at 2:00 PM]\n"
                        + "- Meeting Link / Address: [Google Meet / Zoom link or office location]\n"
                        + "- What to bring / prepare: Please have a working development environment ready.\n\n"
                        + "Please reply to this email to confirm your availability or propose an alternative time.\n\n"
                        + "Best regards,\n"
                        + safeRecruiter + "\n"
                        + "Talent Acquisition Team\n"
                        + safeCompany;
                return new EmailDraftResponse(candidateEmail, subject, body);
            }
            case SELECTED: {
                String subject = "Offer of Employment: " + safeJob + " at " + safeCompany;
                String body = "Hi " + safeCandidate + ",\n\n"
                        + "Congratulations! We are thrilled to offer you the position of " + safeJob + " at " + safeCompany + ".\n\n"
                        + "The team was thoroughly impressed with your experience, problem-solving skills, and overall alignment throughout the interview process. "
                        + "We are confident that your talents will make a significant impact here.\n\n"
                        + "Our HR team will be in touch shortly with the formal offer package, benefits summary, and next onboarding steps. "
                        + "In the meantime, feel free to reach out if you have any questions.\n\n"
                        + "We look forward to welcoming you aboard!\n\n"
                        + "Warm regards,\n"
                        + safeRecruiter + "\n"
                        + "Talent Acquisition Team\n"
                        + safeCompany;
                return new EmailDraftResponse(candidateEmail, subject, body);
            }
            case REJECTED: {
                String subject = "Application Update: " + safeJob + " at " + safeCompany;
                String body = "Hi " + safeCandidate + ",\n\n"
                        + "Thank you for taking the time to interview with us for the " + safeJob + " position at " + safeCompany + ".\n\n"
                        + "While we were very impressed by your qualifications and background, we have decided to proceed with another candidate whose current experience more closely matches our immediate requirements.\n\n"
                        + "We sincerely appreciate the time and effort you invested in learning about " + safeCompany + ". "
                        + "We will keep your profile in our talent network and reach out if a suitable opportunity arises in the future.\n\n"
                        + "We wish you the very best in your career and job search.\n\n"
                        + "Best regards,\n"
                        + safeRecruiter + "\n"
                        + "Talent Acquisition Team\n"
                        + safeCompany;
                return new EmailDraftResponse(candidateEmail, subject, body);
            }
            case CUSTOM:
            default: {
                String subject = "Regarding your application for " + safeJob + " at " + safeCompany;
                String body = "Hi " + safeCandidate + ",\n\n\n\n"
                        + "Best regards,\n"
                        + safeRecruiter + "\n"
                        + "Talent Acquisition Team\n"
                        + safeCompany;
                return new EmailDraftResponse(candidateEmail, subject, body);
            }
        }
    }
}
