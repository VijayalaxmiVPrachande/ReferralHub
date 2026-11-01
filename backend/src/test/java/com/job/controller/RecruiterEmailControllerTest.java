package com.job.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job.dto.SendEmailRequest;
import com.job.entity.Candidate;
import com.job.entity.Job;
import com.job.entity.Referral;
import com.job.entity.ReferralEmail;
import com.job.entity.User;
import com.job.enums.EmailDeliveryStatus;
import com.job.enums.EmailType;
import com.job.enums.Role;
import com.job.enums.Status;
import com.job.repository.CandidateRepository;
import com.job.repository.JobRepository;
import com.job.repository.ReferralEmailRepository;
import com.job.repository.ReferralRepository;
import com.job.repository.UserRepository;
import com.job.service.EmailService;

@SpringBootTest
@ActiveProfiles("test")
class RecruiterEmailControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ReferralRepository referralRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReferralEmailRepository referralEmailRepository;

    @MockitoBean
    private EmailService emailService;

    private User recruiterUser;
    private User employeeUser;
    private Job testJob;
    private Candidate testCandidate;
    private Referral testReferral;

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

        recruiterUser = userRepository.save(User.builder()
                .name("Sarah Recruiter")
                .email("recruiter@demo.com")
                .password("$2a$10$abcdefghijklmnopqrstuv")
                .role(Role.RECRUITER)
                .build());

        employeeUser = userRepository.save(User.builder()
                .name("Bob Staff")
                .email("employee@demo.com")
                .password("$2a$10$abcdefghijklmnopqrstuv")
                .role(Role.EMPLOYEE)
                .build());

        testJob = jobRepository.save(new Job(
                null,
                "Lead Platform Engineer",
                "Java and Spring Boot microservices.",
                "Bengaluru, India"
        ));

        testCandidate = candidateRepository.save(Candidate.builder()
                .name("Alex Smith")
                .email("alex@example.com")
                .phone("+1-555-0199")
                .storedFilename("resume.pdf")
                .build());

        testReferral = referralRepository.save(Referral.builder()
                .candidate(testCandidate)
                .employee(employeeUser)
                .job(testJob)
                .status(Status.REFERRED)
                .createdTime(LocalDateTime.now())
                .build());
    }

    @Test
    @WithMockUser(username = "recruiter@demo.com", roles = {"RECRUITER"})
    @DisplayName("GET /referrals/{id}/email-draft returns pre-filled draft with placeholders")
    void getDraft_asRecruiter_returnsFilledDraft() throws Exception {
        mockMvc.perform(get("/referrals/" + testReferral.getId() + "/email-draft")
                        .param("type", "NEXT_ROUND"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.to").value("alex@example.com"))
                .andExpect(jsonPath("$.subject").value("Interview Invitation: Lead Platform Engineer at ReferralHub"))
                .andExpect(jsonPath("$.body").value(org.hamcrest.Matchers.containsString("Hi Alex Smith,")))
                .andExpect(jsonPath("$.body").value(org.hamcrest.Matchers.containsString("Sarah Recruiter")));
    }

    @Test
    @WithMockUser(username = "employee@demo.com", roles = {"EMPLOYEE"})
    @DisplayName("GET /referrals/{id}/email-draft as EMPLOYEE returns 403 Forbidden")
    void getDraft_asEmployee_returns403() throws Exception {
        mockMvc.perform(get("/referrals/" + testReferral.getId() + "/email-draft")
                        .param("type", "NEXT_ROUND"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "recruiter@demo.com", roles = {"RECRUITER"})
    @DisplayName("POST /referrals/{id}/emails dispatches email, updates status, and returns 200 OK")
    void sendEmail_asRecruiter_success() throws Exception {
        SendEmailRequest req = new SendEmailRequest(
                EmailType.NEXT_ROUND,
                "Invitation to Next Round",
                "Hi Alex,\nWe are excited to invite you to the technical panel round.",
                true,
                true,
                true
        );

        mockMvc.perform(post("/referrals/" + testReferral.getId() + "/emails")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.type").value("NEXT_ROUND"))
                .andExpect(jsonPath("$.toEmail").value("alex@example.com"))
                .andExpect(jsonPath("$.status").value("SENT"))
                .andExpect(jsonPath("$.sentBy.name").value("Sarah Recruiter"));

        Referral updated = referralRepository.findById(testReferral.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(Status.NEXT_ROUND);
        assertThat(updated.getLastEmailAt()).isNotNull();

        assertThat(referralEmailRepository.findAll()).hasSize(1);
    }

    @Test
    @WithMockUser(username = "recruiter@demo.com", roles = {"RECRUITER"})
    @DisplayName("POST /referrals/{id}/emails with newline in subject returns 400 Bad Request")
    void sendEmail_invalidSubjectWithNewline_returns400() throws Exception {
        SendEmailRequest req = new SendEmailRequest(
                EmailType.NEXT_ROUND,
                "Subject with line break\nHeader Injection Attempt",
                "Body content",
                false,
                false,
                false
        );

        mockMvc.perform(post("/referrals/" + testReferral.getId() + "/emails")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @WithMockUser(username = "recruiter@demo.com", roles = {"RECRUITER"})
    @DisplayName("POST /referrals/{id}/emails failure returns 502 Bad Gateway and records FAILED status without altering referral")
    void sendEmail_onDeliveryFailure_returns502AndRecordsFailure() throws Exception {
        doThrow(new RuntimeException("SMTP connection refused: connection timed out"))
                .when(emailService).sendMail(anyString(), anyString(), anyString(), any());

        SendEmailRequest req = new SendEmailRequest(
                EmailType.SELECTED,
                "Offer of Employment",
                "Congratulations Alex!",
                false,
                false,
                true
        );

        mockMvc.perform(post("/referrals/" + testReferral.getId() + "/emails")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.status").value(502))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Failed to deliver email")));

        // Referral status must NOT be modified
        Referral unchanged = referralRepository.findById(testReferral.getId()).orElseThrow();
        assertThat(unchanged.getStatus()).isEqualTo(Status.REFERRED);

        // Audit record must be saved as FAILED
        assertThat(referralEmailRepository.findAll()).hasSize(1);
        ReferralEmail failedRecord = referralEmailRepository.findAll().get(0);
        assertThat(failedRecord.getStatus()).isEqualTo(EmailDeliveryStatus.FAILED);
        assertThat(failedRecord.getErrorMessage()).contains("SMTP connection refused");
    }

    @Test
    @WithMockUser(username = "recruiter@demo.com", roles = {"RECRUITER"})
    @DisplayName("GET /referrals/{id}/emails returns sorted history")
    void getEmailHistory_returnsHistoryList() throws Exception {
        referralEmailRepository.save(ReferralEmail.builder()
                .referral(testReferral)
                .sentBy(recruiterUser)
                .type(EmailType.NEXT_ROUND)
                .toEmail("alex@example.com")
                .subject("First Round Invite")
                .body("Hello Alex")
                .status(EmailDeliveryStatus.SENT)
                .sentAt(LocalDateTime.now().minusDays(1))
                .build());

        referralEmailRepository.save(ReferralEmail.builder()
                .referral(testReferral)
                .sentBy(recruiterUser)
                .type(EmailType.SELECTED)
                .toEmail("alex@example.com")
                .subject("Selected Notice")
                .body("Congratulations Alex")
                .status(EmailDeliveryStatus.SENT)
                .sentAt(LocalDateTime.now())
                .build());

        mockMvc.perform(get("/referrals/" + testReferral.getId() + "/emails"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].subject").value("Selected Notice"))
                .andExpect(jsonPath("$[1].subject").value("First Round Invite"));
    }
}
