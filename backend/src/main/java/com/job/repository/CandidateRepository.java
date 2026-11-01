package com.job.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.job.entity.Candidate;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByEmail(String email);
}
