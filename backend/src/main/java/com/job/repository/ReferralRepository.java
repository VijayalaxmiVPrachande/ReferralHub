package com.job.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.job.entity.Referral;

public interface ReferralRepository extends JpaRepository<Referral, Long> {

    boolean existsByCandidateEmailAndJobId(String email, Long jobId);

    List<Referral> findByEmployeeId(Long employeeId);
    
    Page<Referral> findByEmployeeEmail(String email, Pageable pageable);
}
