package com.job.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.job.dto.JobRequest;
import com.job.dto.JobResponse;
import com.job.entity.Job;
import com.job.exception.NotFoundException;
import com.job.repository.JobRepository;
import com.job.service.JobService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository repo;

    @Override
    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs() {
        return repo.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id) {
        Job job = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Job not found with id: " + id));
        return mapToResponse(job);
    }

    @Override
    @Transactional
    public JobResponse createJob(JobRequest req) {
        Job job = Job.builder()
                .title(req.title().trim())
                .description(req.description() != null ? req.description().trim() : null)
                .location(req.location() != null ? req.location().trim() : null)
                .build();

        Job saved = repo.save(job);
        return mapToResponse(saved);
    }

    private JobResponse mapToResponse(Job job) {
        return new JobResponse(
                job.getId(),
                job.getTitle(),
                job.getDescription(),
                job.getLocation()
        );
    }
}
