package com.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.job.entity.Job;

public interface JobRepository extends JpaRepository<Job, Long> {
}
