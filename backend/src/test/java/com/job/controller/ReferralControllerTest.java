package com.job.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job.dto.CandidateDTO;
import com.job.dto.ReferralRequest;
import com.job.dto.StatusUpdateRequest;
import com.job.entity.Candidate;
import com.job.entity.Job;
import com.job.entity.Referral;
import com.job.entity.User;
import com.job.enums.Role;
import com.job.enums.Status;
import com.job.repository.CandidateRepository;
import com.job.repository.JobRepository;
import com.job.repository.ReferralEmailRepository;
import com.job.repository.ReferralRepository;
import com.job.repository.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
class ReferralControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ReferralEmailRepository referralEmailRepository;

    @Autowired
    private ReferralRepository referralRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    private Job testJob;
    private User employeeUser;
    private User otherEmployeeUser;
    private User recruiterUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        referralEmailRepository.deleteAll();
        referralRepository.deleteAll();
        candidateRepository.deleteAll();
        jobRepository.deleteAll();
        userRepository.deleteAll();

        employeeUser = userRepository.save(User.builder()
                .name("Alice Employee")
                .email("employee@test.com")
                .password("$2a$10$abcdefghijklmnopqrstuv")
                .role(Role.EMPLOYEE)
                .build());

        otherEmployeeUser = userRepository.save(User.builder()
                .name("Bob Other")
                .email("other@test.com")
                .password("$2a$10$abcdefghijklmnopqrstuv")
                .role(Role.EMPLOYEE)
                .build());

        recruiterUser = userRepository.save(User.builder()
                .name("Rachel Recruiter")
                .email("recruiter@test.com")
                .password("$2a$10$abcdefghijklmnopqrstuv")
                .role(Role.RECRUITER)
                .build());

        testJob = jobRepository.save(new Job(
                null,
                "Senior Java Engineer",
                "Requirements include Java, Spring Boot, and Docker microservices.",
                "Bengaluru, India"
        ));
    }

    private byte[] createTestPdf(String text) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 12);
                cs.newLineAtOffset(100, 700);
                cs.showText(text);
                cs.endText();
            }
            doc.save(baos);
        }
        return baos.toByteArray();
    }

    @Test
    @WithMockUser(username = "employee@test.com", roles = {"EMPLOYEE"})
    @DisplayName("POST /referrals as EMPLOYEE creates candidate, computes ATS, and returns 201 Created")
    void createReferral_byEmployee_success() throws Exception {
        byte[] pdfBytes = createTestPdf("Senior developer with Java and Spring Boot expertise.");

        ReferralRequest req = new ReferralRequest(
                testJob.getId(),
                new CandidateDTO("John Candidate", "john@example.com", "+1-555-0199")
        );

        MockMultipartFile dataPart = new MockMultipartFile(
                "data",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(req)
        );

        MockMultipartFile resumePart = new MockMultipartFile(
                "resume",
                "resume.pdf",
                "application/pdf",
                pdfBytes
        );

        mockMvc.perform(multipart("/referrals")
                        .file(dataPart)
                        .file(resumePart))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.status").value("REFERRED"))
                .andExpect(jsonPath("$.candidate.name").value("John Candidate"))
                .andExpect(jsonPath("$.candidate.email").value("john@example.com"))
                .andExpect(jsonPath("$.candidate.phone").value("+1-555-0199"))
                .andExpect(jsonPath("$.atsScore").isNumber())
                .andExpect(jsonPath("$.matchedSkills").isArray())
                .andExpect(jsonPath("$.missingSkills").isArray())
                .andExpect(jsonPath("$.hasResume").value(true))
                .andExpect(jsonPath("$.referredBy").doesNotExist());

        assertThat(candidateRepository.findAll()).hasSize(1);
        assertThat(referralRepository.findAll()).hasSize(1);
    }

    @Test
    @WithMockUser(username = "employee@test.com", roles = {"EMPLOYEE"})
    @DisplayName("POST /referrals with duplicate candidate for same job returns 409 Conflict")
    void createReferral_duplicate_returns409() throws Exception {
        byte[] pdfBytes = createTestPdf("Java engineer resume");

        ReferralRequest req = new ReferralRequest(
                testJob.getId(),
                new CandidateDTO("John Candidate", "john@example.com", "+1-555-0199")
        );

        MockMultipartFile dataPart = new MockMultipartFile(
                "data", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(req)
        );
        MockMultipartFile resumePart = new MockMultipartFile(
                "resume", "resume.pdf", "application/pdf", pdfBytes
        );

        // First referral succeeds
        mockMvc.perform(multipart("/referrals").file(dataPart).file(resumePart))
                .andExpect(status().isCreated());

        // Duplicate submission fails with 409
        mockMvc.perform(multipart("/referrals").file(dataPart).file(resumePart))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Candidate has already been referred for this job"));
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = {"RECRUITER"})
    @DisplayName("POST /referrals as RECRUITER returns 403 Forbidden")
    void createReferral_byRecruiter_returns403() throws Exception {
        byte[] pdfBytes = createTestPdf("Java resume");
        ReferralRequest req = new ReferralRequest(
                testJob.getId(),
                new CandidateDTO("John Candidate", "john@example.com", "+1-555-0199")
        );

        MockMultipartFile dataPart = new MockMultipartFile(
                "data", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(req)
        );
        MockMultipartFile resumePart = new MockMultipartFile(
                "resume", "resume.pdf", "application/pdf", pdfBytes
        );

        mockMvc.perform(multipart("/referrals").file(dataPart).file(resumePart))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Access denied: insufficient permissions"));
    }

    @Test
    @WithMockUser(username = "employee@test.com", roles = {"EMPLOYEE"})
    @DisplayName("POST /referrals with unsupported file type returns 400 Bad Request")
    void createReferral_unsupportedFileType_returns400() throws Exception {
        ReferralRequest req = new ReferralRequest(
                testJob.getId(),
                new CandidateDTO("John Candidate", "john@example.com", "+1-555-0199")
        );

        MockMultipartFile dataPart = new MockMultipartFile(
                "data", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(req)
        );
        MockMultipartFile textFilePart = new MockMultipartFile(
                "resume", "resume.txt", "text/plain", "This is plain text resume".getBytes()
        );

        mockMvc.perform(multipart("/referrals").file(dataPart).file(textFilePart))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Invalid file format. Only PDF and DOCX files are allowed"));
    }

    @Test
    @WithMockUser(username = "employee@test.com", roles = {"EMPLOYEE"})
    @DisplayName("GET /referrals as EMPLOYEE returns only own referrals and null referredBy")
    void getAll_asEmployee_scopesToSelf() throws Exception {
        Candidate c1 = candidateRepository.save(Candidate.builder()
                .name("Candidate One")
                .email("one@example.com")
                .storedFilename("file1.pdf")
                .build());

        Candidate c2 = candidateRepository.save(Candidate.builder()
                .name("Candidate Two")
                .email("two@example.com")
                .storedFilename("file2.pdf")
                .build());

        referralRepository.save(Referral.builder()
                .candidate(c1)
                .employee(employeeUser)
                .job(testJob)
                .status(Status.REFERRED)
                .build());

        referralRepository.save(Referral.builder()
                .candidate(c2)
                .employee(otherEmployeeUser)
                .job(testJob)
                .status(Status.REFERRED)
                .build());

        mockMvc.perform(get("/referrals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].candidate.name").value("Candidate One"))
                .andExpect(jsonPath("$.content[0].referredBy").doesNotExist());
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = {"RECRUITER"})
    @DisplayName("GET /referrals as RECRUITER returns all referrals and populates referredBy")
    void getAll_asRecruiter_returnsAll() throws Exception {
        Candidate c1 = candidateRepository.save(Candidate.builder()
                .name("Candidate One")
                .email("one@example.com")
                .storedFilename("file1.pdf")
                .build());

        Candidate c2 = candidateRepository.save(Candidate.builder()
                .name("Candidate Two")
                .email("two@example.com")
                .storedFilename("file2.pdf")
                .build());

        referralRepository.save(Referral.builder()
                .candidate(c1)
                .employee(employeeUser)
                .job(testJob)
                .status(Status.REFERRED)
                .build());

        referralRepository.save(Referral.builder()
                .candidate(c2)
                .employee(otherEmployeeUser)
                .job(testJob)
                .status(Status.IN_REVIEW)
                .build());

        mockMvc.perform(get("/referrals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].referredBy").isNotEmpty());
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = {"RECRUITER"})
    @DisplayName("PATCH /referrals/{id}/status as RECRUITER updates status and returns 200 OK")
    void updateStatus_byRecruiter_returns200() throws Exception {
        Candidate c = candidateRepository.save(Candidate.builder()
                .name("Candidate Status")
                .email("status@example.com")
                .build());

        Referral ref = referralRepository.save(Referral.builder()
                .candidate(c)
                .employee(employeeUser)
                .job(testJob)
                .status(Status.REFERRED)
                .build());

        mockMvc.perform(patch("/referrals/" + ref.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StatusUpdateRequest(Status.NEXT_ROUND))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ref.getId()))
                .andExpect(jsonPath("$.status").value("NEXT_ROUND"));

        Referral updated = referralRepository.findById(ref.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(Status.NEXT_ROUND);
    }

    @Test
    @WithMockUser(username = "employee@test.com", roles = {"EMPLOYEE"})
    @DisplayName("PATCH /referrals/{id}/status as EMPLOYEE returns 403 Forbidden")
    void updateStatus_byEmployee_returns403() throws Exception {
        Candidate c = candidateRepository.save(Candidate.builder()
                .name("Candidate Status")
                .email("status2@example.com")
                .build());

        Referral ref = referralRepository.save(Referral.builder()
                .candidate(c)
                .employee(employeeUser)
                .job(testJob)
                .status(Status.REFERRED)
                .build());

        mockMvc.perform(patch("/referrals/" + ref.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StatusUpdateRequest(Status.NEXT_ROUND))))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "recruiter@test.com", roles = {"RECRUITER"})
    @DisplayName("GET /referrals/stats returns status counts and total")
    void getStats_asRecruiter_returnsStats() throws Exception {
        Candidate c1 = candidateRepository.save(Candidate.builder()
                .name("Candidate 1")
                .email("c1@example.com")
                .build());

        referralRepository.save(Referral.builder()
                .candidate(c1)
                .employee(employeeUser)
                .job(testJob)
                .status(Status.REFERRED)
                .build());

        mockMvc.perform(get("/referrals/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.REFERRED").value(1))
                .andExpect(jsonPath("$.IN_REVIEW").value(0))
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    @WithMockUser(username = "other@test.com", roles = {"EMPLOYEE"})
    @DisplayName("GET /referrals/{id}/resume as non-owner employee returns 404 Not Found")
    void downloadResume_nonOwnerEmployee_returns404() throws Exception {
        Candidate c = candidateRepository.save(Candidate.builder()
                .name("Candidate One")
                .email("one@example.com")
                .storedFilename("file1.pdf")
                .build());

        Referral ref = referralRepository.save(Referral.builder()
                .candidate(c)
                .employee(employeeUser)
                .job(testJob)
                .status(Status.REFERRED)
                .build());

        mockMvc.perform(get("/referrals/" + ref.getId() + "/resume"))
                .andExpect(status().isNotFound());
    }
}
