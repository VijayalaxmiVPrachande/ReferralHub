package com.job.service.impl;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.job.dto.PagedResponse;
import com.job.dto.ReferralRequest;
import com.job.dto.ReferralResponse;
import com.job.dto.ReferralStatsResponse;
import com.job.entity.Candidate;
import com.job.entity.Job;
import com.job.entity.Referral;
import com.job.entity.User;
import com.job.enums.Role;
import com.job.enums.Status;
import com.job.exception.ConflictException;
import com.job.exception.ForbiddenException;
import com.job.exception.NotFoundException;
import com.job.repository.CandidateRepository;
import com.job.repository.JobRepository;
import com.job.repository.ReferralRepository;
import com.job.repository.UserRepository;
import com.job.service.EmailService;
import com.job.service.ReferralService;
import com.job.service.StorageService;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
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
    @Transactional
    public ReferralResponse create(ReferralRequest req, MultipartFile resume, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getRole() != Role.EMPLOYEE) {
            throw new ForbiddenException("Only employees can submit referrals");
        }

        String candidateEmail = req.candidate().email().trim().toLowerCase(Locale.ROOT);

        if (refRepo.existsByCandidateEmailAndJobId(candidateEmail, req.jobId())) {
            throw new ConflictException("Candidate has already been referred for this job");
        }

        Job job = jobRepo.findById(req.jobId())
                .orElseThrow(() -> new NotFoundException("Job not found with id: " + req.jobId()));

        String storedFilename = storageService.store(resume);

        Candidate candidate = candRepo.findByEmail(candidateEmail).orElseGet(() -> {
            Candidate c = new Candidate();
            c.setEmail(candidateEmail);
            return c;
        });

        candidate.setName(req.candidate().name().trim());
        if (req.candidate().phone() != null) {
            candidate.setPhone(req.candidate().phone().trim());
        }
        candidate.setStoredFilename(storedFilename);
        candidate.setResumeUrl("/referrals/" + storedFilename);
        candidate = candRepo.save(candidate);

        Map<String, Object> atsResult = runAtsAnalysis(resume, job.getDescription());

        Referral referral = Referral.builder()
                .candidate(candidate)
                .employee(user)
                .job(job)
                .status(Status.REFERRED)
                .atsScore((Integer) atsResult.get("score"))
                .matchedSkills((String) atsResult.get("matched"))
                .missingSkills((String) atsResult.get("missing"))
                .atsLabel((String) atsResult.get("label"))
                .createdTime(LocalDateTime.now())
                .build();

        referral = refRepo.save(referral);

        try {
            emailService.sendAsyncAcknowledgement(
                    candidate.getEmail(),
                    "Referral Submitted: " + job.getTitle(),
                    "Hi " + candidate.getName() + ",\n\n"
                            + "You have been referred for the position of " + job.getTitle() + " at ReferralHub.\n"
                            + "Our recruitment team will review your application.\n\n"
                            + "Best regards,\nRecruitment Team"
            );
        } catch (Exception e) {
            log.warn("Could not dispatch async confirmation email: {}", e.getMessage());
        }

        return toResponse(referral, false);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReferralResponse> getAll(int page, int size, String sort, Status status, String q, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        boolean isRecruiter = (user.getRole() == Role.RECRUITER);

        Specification<Referral> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!isRecruiter) {
                predicates.add(cb.equal(root.get("employee").get("email"), email));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (q != null && !q.trim().isEmpty()) {
                String term = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("candidate").get("name")), term);
                Predicate emailMatch = cb.like(cb.lower(root.get("candidate").get("email")), term);
                Predicate jobMatch = cb.like(cb.lower(root.get("job").get("title")), term);
                predicates.add(cb.or(nameMatch, emailMatch, jobMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sortObj;
        if ("ats".equalsIgnoreCase(sort)) {
            sortObj = Sort.by(Sort.Direction.DESC, "atsScore")
                    .and(Sort.by(Sort.Direction.DESC, "createdTime"));
        } else {
            sortObj = Sort.by(Sort.Direction.DESC, "createdTime");
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<Referral> paged = refRepo.findAll(spec, pageable);

        List<ReferralResponse> content = paged.getContent().stream()
                .map(r -> toResponse(r, isRecruiter))
                .toList();

        return new PagedResponse<>(
                content,
                paged.getNumber(),
                paged.getSize(),
                paged.getTotalPages(),
                paged.getTotalElements()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ReferralResponse getOne(Long id, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Referral referral = refRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Referral not found with id: " + id));

        boolean isRecruiter = (user.getRole() == Role.RECRUITER);
        if (!isRecruiter && !referral.getEmployee().getEmail().equalsIgnoreCase(email)) {
            throw new NotFoundException("Referral not found with id: " + id);
        }

        return toResponse(referral, isRecruiter);
    }

    @Override
    @Transactional
    public ReferralResponse updateStatus(Long id, Status status, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getRole() != Role.RECRUITER) {
            throw new ForbiddenException("Only recruiters can update referral status");
        }

        Referral referral = refRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Referral not found with id: " + id));

        referral.setStatus(status);
        referral = refRepo.save(referral);

        return toResponse(referral, true);
    }

    @Override
    @Transactional(readOnly = true)
    public ReferralStatsResponse getStats(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getRole() == Role.RECRUITER) {
            long referred = refRepo.countByStatus(Status.REFERRED);
            long inReview = refRepo.countByStatus(Status.IN_REVIEW);
            long nextRound = refRepo.countByStatus(Status.NEXT_ROUND);
            long selected = refRepo.countByStatus(Status.SELECTED);
            long rejected = refRepo.countByStatus(Status.REJECTED);
            long total = refRepo.count();

            return new ReferralStatsResponse(referred, inReview, nextRound, selected, rejected, total);
        } else {
            long referred = refRepo.countByEmployeeEmailAndStatus(email, Status.REFERRED);
            long inReview = refRepo.countByEmployeeEmailAndStatus(email, Status.IN_REVIEW);
            long nextRound = refRepo.countByEmployeeEmailAndStatus(email, Status.NEXT_ROUND);
            long selected = refRepo.countByEmployeeEmailAndStatus(email, Status.SELECTED);
            long rejected = refRepo.countByEmployeeEmailAndStatus(email, Status.REJECTED);
            long total = refRepo.countByEmployeeEmail(email);

            return new ReferralStatsResponse(referred, inReview, nextRound, selected, rejected, total);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadResume(Long id, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Referral referral = refRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Referral not found with id: " + id));

        if (user.getRole() != Role.RECRUITER && !referral.getEmployee().getEmail().equalsIgnoreCase(email)) {
            throw new NotFoundException("Referral not found with id: " + id);
        }

        String storedFilename = referral.getCandidate().getStoredFilename();
        if (storedFilename == null || storedFilename.isBlank()) {
            throw new NotFoundException("Resume not available for referral id: " + id);
        }

        return storageService.loadAsResource(storedFilename);
    }

    @Override
    @Transactional(readOnly = true)
    public String getResumeFilename(Long id, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Referral referral = refRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Referral not found with id: " + id));

        if (user.getRole() != Role.RECRUITER && !referral.getEmployee().getEmail().equalsIgnoreCase(email)) {
            throw new NotFoundException("Referral not found with id: " + id);
        }

        String storedFilename = referral.getCandidate().getStoredFilename();
        String ext = ".pdf";
        if (storedFilename != null && storedFilename.toLowerCase(Locale.ROOT).endsWith(".docx")) {
            ext = ".docx";
        }

        String safeCandidateName = referral.getCandidate().getName() != null
                ? referral.getCandidate().getName().trim().replaceAll("[^a-zA-Z0-9-_]", "_")
                : "Candidate";

        return safeCandidateName + "-resume" + ext;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private ReferralResponse toResponse(Referral ref, boolean isRecruiter) {
        ReferralResponse.JobSummary jobSummary = ref.getJob() != null
                ? new ReferralResponse.JobSummary(ref.getJob().getId(), ref.getJob().getTitle())
                : null;

        ReferralResponse.CandidateSummary candidateSummary = ref.getCandidate() != null
                ? new ReferralResponse.CandidateSummary(ref.getCandidate().getName(), ref.getCandidate().getEmail(), ref.getCandidate().getPhone())
                : null;

        ReferralResponse.ReferrerSummary referrerSummary = (isRecruiter && ref.getEmployee() != null)
                ? new ReferralResponse.ReferrerSummary(ref.getEmployee().getName(), ref.getEmployee().getEmail())
                : null;

        boolean hasResume = ref.getCandidate() != null
                && ref.getCandidate().getStoredFilename() != null
                && !ref.getCandidate().getStoredFilename().isBlank();

        LocalDateTime lastEmailAt = isRecruiter ? ref.getLastEmailAt() : null;

        return new ReferralResponse(
                ref.getId(),
                ref.getStatus(),
                ref.getCreatedTime(),
                ref.getAtsScore(),
                ref.getAtsLabel(),
                parseSkills(ref.getMatchedSkills()),
                parseSkills(ref.getMissingSkills()),
                jobSummary,
                candidateSummary,
                referrerSummary,
                hasResume,
                lastEmailAt
        );
    }

    private List<String> parseSkills(String str) {
        if (str == null || str.isBlank()) {
            return List.of();
        }
        return Arrays.stream(str.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private Map<String, Object> runAtsAnalysis(MultipartFile resume, String jobDescription) {
        String resumeText = "";
        try (InputStream is = resume.getInputStream()) {
            String filename = resume.getOriginalFilename() != null ? resume.getOriginalFilename().toLowerCase(Locale.ROOT) : "";
            if (filename.endsWith(".pdf")) {
                try (PDDocument doc = PDDocument.load(is)) {
                    resumeText = new PDFTextStripper().getText(doc).toLowerCase(Locale.ROOT);
                }
            } else if (filename.endsWith(".docx")) {
                try (XWPFDocument doc = new XWPFDocument(is);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    resumeText = extractor.getText().toLowerCase(Locale.ROOT);
                }
            }
        } catch (Exception e) {
            log.warn("Error extracting resume text: {}", e.getMessage());
        }

        if (resumeText.isEmpty() || jobDescription == null || jobDescription.isEmpty()) {
            return Map.of("score", 0, "matched", "", "missing", "", "label", "Analysis Failed");
        }

        String jdText = jobDescription.toLowerCase(Locale.ROOT);
        List<String> requiredSkills = new ArrayList<>();
        List<String> candidateSkills = new ArrayList<>();

        for (String skill : SKILL_DICTIONARY) {
            String regex = "(?<![a-zA-Z0-9])" + Pattern.quote(skill) + "(?![a-zA-Z0-9])";
            Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);

            if (pattern.matcher(jdText).find()) {
                requiredSkills.add(skill);
            }
            if (pattern.matcher(resumeText).find()) {
                candidateSkills.add(skill);
            }
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
            Set<String> jdWords = new HashSet<>(Arrays.asList(jdText.split("\\W+")));
            jdWords.removeIf(w -> w.length() < 4);
            if (!jdWords.isEmpty()) {
                int matchCount = 0;
                for (String w : jdWords) {
                    if (resumeText.contains(w)) {
                        matchCount++;
                    }
                }
                score = (int) Math.round(((double) matchCount / jdWords.size()) * 100);
                if (score > 100) {
                    score = 100;
                }
            }
        }

        String label = score >= 80 ? "Highly Recommended" : score >= 50 ? "Recommended" : "Low Match";

        return Map.of(
                "score", score,
                "matched", String.join(", ", matched),
                "missing", String.join(", ", missing),
                "label", label
        );
    }
}