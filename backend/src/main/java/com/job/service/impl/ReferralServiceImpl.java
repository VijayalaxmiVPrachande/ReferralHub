package com.job.service.impl;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.job.dto.ReferralRequest;
import com.job.entity.Candidate;
import com.job.entity.Referral;
import com.job.entity.User;
import com.job.enums.Role;
import com.job.enums.Status;
import com.job.repository.CandidateRepository;
import com.job.repository.JobRepository;
import com.job.repository.ReferralRepository;
import com.job.repository.UserRepository;
import com.job.service.EmailService;
import com.job.service.ReferralService;
import com.job.service.StorageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReferralServiceImpl implements ReferralService {

    private static final List<String> SKILL_DICTIONARY = Arrays.asList(
            "java", "spring boot", "spring", "react", "angular", "node.js", "nodejs", "express",
            "python", "django", "flask", "ruby on rails", "ruby", "c++", "c#", ".net", "go", "golang",
            "rust", "php", "laravel", "vue.js", "vue", "javascript", "typescript", "html", "css",
            "sql", "mysql", "postgresql", "mongodb", "nosql", "redis", "elasticsearch", "kafka",
            "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "ci/cd",
            "git", "github", "gitlab", "bitbucket", "linux", "unix", "bash", "agile", "scrum",
            "microservices", "rest api", "graphql", "hibernate", "jpa", "junit", "mockito",
            "system design", "data structures", "algorithms");

    private final ReferralRepository refRepo;
    private final CandidateRepository candRepo;
    private final JobRepository jobRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;
    private final StorageService storageService;

    @Override
    public ResponseEntity<?> create(ReferralRequest req, MultipartFile resume, String email) {

        // Duplicate guard
        if (refRepo.existsByCandidateEmailAndJobId(
                req.getCandidate().getEmail(), req.getJobId()))
            throw new RuntimeException("Duplicate referral");

        // Upload resume locally
        String filename = storageService.store(resume);
        String resumeUrl = "/api/files/preview/" + filename;

        // Persist candidate
        Candidate c = new Candidate();
        c.setName(req.getCandidate().getName());
        c.setEmail(req.getCandidate().getEmail());
        c.setPhone(req.getCandidate().getPhone());
        c.setResumeUrl(resumeUrl);
        c.setResumePublicId(filename);
        candRepo.save(c);

        // Run ATS Analysis
        com.job.entity.Job job = jobRepo.findById(req.getJobId()).orElseThrow();
        Map<String, Object> atsResult = runAtsAnalysis(resume, job.getDescription());

        // Persist referral
        Referral ref = Referral.builder()
                .candidate(c)
                .employee(userRepo.findByEmail(email).orElseThrow())
                .job(job)
                .status(Status.REFERRED)
                .atsScore((Integer) atsResult.get("score"))
                .matchedSkills((String) atsResult.get("matched"))
                .missingSkills((String) atsResult.get("missing"))
                .atsLabel((String) atsResult.get("label"))
                .createdTime(LocalDateTime.now())
                .build();
        refRepo.save(ref);

        // Notify candidate
        emailService.sendMail(
                c.getEmail(),
                "Your referral has been submitted",
                "Hi " + c.getName() + ",\n\nYou have been referred for the position of "
                        + ref.getJob().getTitle()
                        + ". We will keep you posted on your application status."
                        + "\n\nBest regards,\nRecruitment Team");

        return ResponseEntity.ok("Referral created successfully");
    }

    @Override
    public Page<Referral> getAll(int page, int size, String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        if (user.getRole() == Role.RECRUITER) {
            return refRepo.findAll(PageRequest.of(page, size));
        } else {
            return refRepo.findByEmployeeEmail(email, PageRequest.of(page, size));
        }
    }

    @Override
    public Referral getOne(Long id) {
        return refRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Referral not found"));
    }

    @Override
    public ResponseEntity<?> downloadResume(Long id) {
        Referral ref = refRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Referral not found"));

        String filename = ref.getCandidate().getResumePublicId();

        if (filename == null || filename.isBlank()) {
            throw new RuntimeException("No resume filename found for this referral");
        }

        try {
            // Redirect to the new FileController download endpoint
            return ResponseEntity.status(302)
                    .location(java.net.URI.create("/api/files/download/" + filename))
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Error generating download URL: " + e.getMessage(), e);
        }
    }

    @Override
    public ResponseEntity<?> updateStatus(Long id, Status status) {
        Referral ref = refRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Referral not found"));

        ref.setStatus(status);
        refRepo.save(ref);

        // Email candidate on every status change
        String candidateName = ref.getCandidate().getName();
        String candidateEmail = ref.getCandidate().getEmail();
        String jobTitle = ref.getJob().getTitle();

        String subject = "Update on your application for " + jobTitle;
        String body = buildStatusEmail(candidateName, jobTitle, status);

        emailService.sendMail(candidateEmail, subject, body);

        // Notify referring employee as well
        try {
            User referrer = ref.getEmployee();
            if (referrer != null && referrer.getEmail() != null) {
                String referrerSubject = "Update on your referral: " + candidateName;
                String referrerBody = "Hi " + referrer.getName() + ",\n\n"
                        + "The status of the candidate you referred (" + candidateName + ") for the position of "
                        + jobTitle + " has been updated to: " + status.toString().replace("_", " ") + ".\n\n"
                        + "Best regards,\nRecruitment Team";
                emailService.sendMail(referrer.getEmail(), referrerSubject, referrerBody);
            }
        } catch (Exception e) {
            System.err.println("Failed to send status update email to referrer: " + e.getMessage());
        }

        return ResponseEntity.ok("Status updated to " + status);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Map<String, Object> runAtsAnalysis(MultipartFile resume, String jobDescription) {
        String resumeText = "";
        try (InputStream is = resume.getInputStream()) {
            String filename = resume.getOriginalFilename() != null ? resume.getOriginalFilename().toLowerCase() : "";
            if (filename.endsWith(".pdf")) {
                try (PDDocument doc = PDDocument.load(is)) {
                    resumeText = new PDFTextStripper().getText(doc).toLowerCase();
                }
            } else if (filename.endsWith(".docx")) {
                try (XWPFDocument doc = new XWPFDocument(is);
                        XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    resumeText = extractor.getText().toLowerCase();
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting resume text: " + e.getMessage());
        }

        if (resumeText.isEmpty() || jobDescription == null || jobDescription.isEmpty()) {
            return Map.of("score", 0, "matched", "", "missing", "", "label", "Analysis Failed");
        }

        String jdText = jobDescription.toLowerCase();
        List<String> requiredSkills = new ArrayList<>();
        List<String> candidateSkills = new ArrayList<>();

        for (String skill : SKILL_DICTIONARY) {
            String regex = "\\b" + java.util.regex.Pattern.quote(skill) + "\\b";
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(regex);

            if (pattern.matcher(jdText).find())
                requiredSkills.add(skill);
            if (pattern.matcher(resumeText).find())
                candidateSkills.add(skill);
        }

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : requiredSkills) {
            if (candidateSkills.contains(req)) {
                matched.add(req);
            } else {
                missing.add(req);
            }
        }

        int score = 0;
        if (!requiredSkills.isEmpty()) {
            score = (int) Math.round(((double) matched.size() / requiredSkills.size()) * 100);
        } else {
            // Fallback: general word intersection if no dict skills found
            Set<String> jdWords = new HashSet<>(Arrays.asList(jdText.split("\\W+")));
            jdWords.removeIf(w -> w.length() < 4);
            if (!jdWords.isEmpty()) {
                int matchCount = 0;
                for (String w : jdWords) {
                    if (resumeText.contains(w))
                        matchCount++;
                }
                score = (int) Math.round(((double) matchCount / jdWords.size()) * 100);
                if (score > 100)
                    score = 100;
            }
        }

        String label = score >= 80 ? "Highly Recommended" : score >= 50 ? "Recommended" : "Low Match";

        return Map.of(
                "score", score,
                "matched", String.join(", ", matched),
                "missing", String.join(", ", missing),
                "label", label);
    }

    private String buildStatusEmail(String name, String jobTitle, Status status) {
        String statusLine = switch (status) {
            case IN_REVIEW -> "Your application is currently under review by our recruitment team.";
            case SELECTED ->
                "Congratulations! You have been selected for the position. Our team will reach out shortly.";
            case REJECTED ->
                "After careful consideration, we regret to inform you that your application was not successful at this time.";
            default -> "Your application status has been updated to: " + status;
        };
        return "Hi " + name + ",\n\n" + statusLine
                + "\n\nPosition: " + jobTitle
                + "\n\nBest regards,\nRecruitment Team";
    }
}