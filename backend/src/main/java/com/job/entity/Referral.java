package com.job.entity;

import java.time.LocalDateTime;

import com.job.enums.Status;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Job job;

    @ManyToOne
    private User employee;

    @ManyToOne
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    private Status status;

    private Integer atsScore;
    
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String matchedSkills;
    
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String missingSkills;
    
    private String atsLabel;

    private LocalDateTime createdTime;
}
