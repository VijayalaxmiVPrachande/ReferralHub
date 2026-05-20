package com.job.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.job.dto.JobDTO;
import com.job.entity.Job;
import com.job.repository.JobRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobRepository repo;

    @PostMapping("/add")
    public ResponseEntity<JobDTO> create(@RequestBody Job job) {
        Job saved = repo.save(job);

        JobDTO dto = new JobDTO();
        dto.setId(saved.getId());
        dto.setTitle(saved.getTitle());
        dto.setDescription(saved.getDescription());
        dto.setLocation(saved.getLocation());

        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<JobDTO>> getAll() {
        return ResponseEntity.ok(
            repo.findAll().stream().map(j -> {
                JobDTO d = new JobDTO();
                d.setId(j.getId());
                d.setTitle(j.getTitle());
                d.setDescription(j.getDescription());
                d.setLocation(j.getLocation());
                return d;
            }).toList()
        );
    }
}