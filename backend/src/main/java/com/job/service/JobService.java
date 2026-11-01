package com.job.service;

import java.util.List;

import com.job.dto.JobRequest;
import com.job.dto.JobResponse;

public interface JobService {
    List<JobResponse> getAllJobs();
    JobResponse getJobById(Long id);
    JobResponse createJob(JobRequest request);
}
