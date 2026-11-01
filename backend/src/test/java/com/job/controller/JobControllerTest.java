package com.job.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.job.dto.JobRequest;
import com.job.entity.Job;
import com.job.repository.JobRepository;

@SpringBootTest
@ActiveProfiles("test")
class JobControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private JobRepository jobRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        jobRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "recruiter@demo.com", roles = {"RECRUITER"})
    @DisplayName("POST /jobs as RECRUITER creates job and returns 201 Created")
    void createJob_byRecruiter_returns201() throws Exception {
        JobRequest req = new JobRequest(
                "Lead Platform Architect",
                "Architecting distributed microservices with Java, Spring Boot, and Kubernetes.",
                "Bengaluru, India"
        );

        mockMvc.perform(post("/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Lead Platform Architect"))
                .andExpect(jsonPath("$.location").value("Bengaluru, India"));

        assertThat(jobRepository.findAll()).hasSize(1);
    }

    @Test
    @WithMockUser(username = "employee@demo.com", roles = {"EMPLOYEE"})
    @DisplayName("POST /jobs as EMPLOYEE returns 403 Forbidden with standard error shape")
    void createJob_byEmployee_returns403() throws Exception {
        JobRequest req = new JobRequest(
                "Unauthorized Job",
                "Employee should not be able to create jobs.",
                "Remote"
        );

        mockMvc.perform(post("/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Access denied: insufficient permissions"));
    }

    @Test
    @WithMockUser(username = "recruiter@demo.com", roles = {"RECRUITER"})
    @DisplayName("POST /jobs with description > 1000 characters persists in TEXT column without truncation")
    void createJob_withLongDescription_persistsSuccessfully() throws Exception {
        String longDescription = "Deep technical role requiring expertise in system scalability. "
                + "Requirements: ".repeat(80); // > 1000 characters (1183 chars)

        assertThat(longDescription.length()).isGreaterThan(1000);

        JobRequest req = new JobRequest(
                "Staff Infrastructure Engineer",
                longDescription,
                "Remote"
        );

        mockMvc.perform(post("/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value(longDescription.trim()));

        Job saved = jobRepository.findAll().get(0);
        assertThat(saved.getDescription()).isEqualTo(longDescription.trim());
    }

    @Test
    @WithMockUser(username = "recruiter@demo.com", roles = {"RECRUITER"})
    @DisplayName("POST /jobs with blank title returns 400 Bad Request with field errors")
    void createJob_blankTitle_returns400() throws Exception {
        JobRequest req = new JobRequest("", "Description", "Location");

        mockMvc.perform(post("/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.title").isNotEmpty());
    }

    @Test
    @WithMockUser(username = "employee@demo.com", roles = {"EMPLOYEE"})
    @DisplayName("GET /jobs returns list of all jobs for authenticated employee")
    void getAllJobs_returnsList() throws Exception {
        jobRepository.save(Job.builder().title("Backend Dev").location("Remote").description("Java").build());
        jobRepository.save(Job.builder().title("Frontend Dev").location("New York").description("React").build());

        mockMvc.perform(get("/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Backend Dev"))
                .andExpect(jsonPath("$[1].title").value("Frontend Dev"));
    }

    @Test
    @WithMockUser(username = "employee@demo.com", roles = {"EMPLOYEE"})
    @DisplayName("GET /jobs/{id} returns 404 for nonexistent job id")
    void getJobById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/jobs/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Job not found with id: 99999"));
    }
}
