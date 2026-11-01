package com.job.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.job.entity.Job;
import com.job.entity.User;
import com.job.enums.Role;
import com.job.repository.JobRepository;
import com.job.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final JobRepository jobRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.password:DemoPassword123!}")
    private String demoPassword;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) {
            log.info("Users table not empty. Skipping dev data seeding.");
            return;
        }

        log.info("Seeding initial development users and jobs...");

        String encodedPassword = passwordEncoder.encode(demoPassword);

        User recruiter = User.builder()
                .name("Demo Recruiter")
                .email("recruiter@demo.com")
                .password(encodedPassword)
                .role(Role.RECRUITER)
                .build();

        User employee = User.builder()
                .name("Demo Employee")
                .email("employee@demo.com")
                .password(encodedPassword)
                .role(Role.EMPLOYEE)
                .build();

        userRepo.saveAll(List.of(recruiter, employee));

        Job job1 = new Job();
        job1.setTitle("Senior Full Stack Engineer");
        job1.setDescription("We are seeking a Senior Full Stack Engineer proficient in React, Node.js, Java, Spring Boot, MySQL, and Docker to build and scale internal applications.");
        job1.setLocation("San Francisco, CA (Hybrid)");

        Job job2 = new Job();
        job2.setTitle("Backend Platform Engineer");
        job2.setDescription("Join our platform team building microservices using Java, Spring Boot, PostgreSQL, Kafka, Redis, and Kubernetes. Strong experience in system design and REST APIs is required.");
        job2.setLocation("Remote");

        Job job3 = new Job();
        job3.setTitle("Frontend UI/UX Developer");
        job3.setDescription("Looking for a passionate Frontend Engineer with experience in React, JavaScript, HTML, CSS, and modern responsive web design to craft intuitive recruitment interfaces.");
        job3.setLocation("New York, NY");

        jobRepo.saveAll(List.of(job1, job2, job3));

        log.info("Dev data seeding complete: 2 demo users and 3 jobs created.");
    }
}
