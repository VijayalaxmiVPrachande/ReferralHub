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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.job.dto.LoginRequest;
import com.job.dto.RegisterRequest;
import com.job.entity.User;
import com.job.enums.Role;
import com.job.repository.UserRepository;

@SpringBootTest
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("POST /auth/register creates EMPLOYEE by default and ignores client-injected role")
    void register_createsEmployeeByDefault() throws Exception {
        RegisterRequest req = new RegisterRequest(
                "Alice Employee",
                "alice@example.com",
                "Password123!",
                null
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User registered successfully"));

        User user = userRepository.findByEmail("alice@example.com").orElse(null);
        assertThat(user).isNotNull();
        assertThat(user.getRole()).isEqualTo(Role.EMPLOYEE);
        assertThat(user.getName()).isEqualTo("Alice Employee");
    }

    @Test
    @DisplayName("POST /auth/register with valid recruiter invite code creates RECRUITER")
    void register_withRecruiterInviteCode_createsRecruiter() throws Exception {
        RegisterRequest req = new RegisterRequest(
                "Bob Recruiter",
                "bob@example.com",
                "Password123!",
                "TEST_RECRUITER_INVITE"
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User registered successfully"));

        User user = userRepository.findByEmail("bob@example.com").orElse(null);
        assertThat(user).isNotNull();
        assertThat(user.getRole()).isEqualTo(Role.RECRUITER);
    }

    @Test
    @DisplayName("POST /auth/register with duplicate email returns 409 Conflict")
    void register_duplicateEmail_returns409Conflict() throws Exception {
        RegisterRequest req1 = new RegisterRequest(
                "Charlie",
                "charlie@example.com",
                "Password123!",
                null
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        RegisterRequest req2 = new RegisterRequest(
                "Charlie Duplicate",
                "charlie@example.com",
                "AnotherPassword123!",
                null
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    @DisplayName("POST /auth/login with valid credentials returns 200 with AuthResponse")
    void login_validCredentials_returnsTokenAndUserInfo() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "Dana Employee",
                "dana@example.com",
                "Password123!",
                null
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = new LoginRequest("dana@example.com", "Password123!");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.role").value("EMPLOYEE"))
                .andExpect(jsonPath("$.name").value("Dana Employee"))
                .andExpect(jsonPath("$.email").value("dana@example.com"));
    }

    @Test
    @DisplayName("POST /auth/login with invalid password returns 401 with generic error")
    void login_invalidPassword_returns401() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "Eve Employee",
                "eve@example.com",
                "Password123!",
                null
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = new LoginRequest("eve@example.com", "WrongPassword123!");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("GET /auth/me returns current user profile when authenticated")
    void getMe_authenticated_returnsProfile() throws Exception {
        RegisterRequest registerReq = new RegisterRequest(
                "Frank Employee",
                "frank@example.com",
                "Password123!",
                null
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = new LoginRequest("frank@example.com", "Password123!");
        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = loginJson.get("accessToken").asText();

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Frank Employee"))
                .andExpect(jsonPath("$.email").value("frank@example.com"))
                .andExpect(jsonPath("$.role").value("EMPLOYEE"));
    }

    @Test
    @DisplayName("GET /auth/me without token returns 401 JSON error")
    void getMe_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    @DisplayName("GET /auth/me with invalid token returns 401 JSON error")
    void getMe_invalidToken_returns401() throws Exception {
        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer this_is_an_invalid_token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid or expired token"));
    }
}
