package com.job.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.job.entity.Referral;
import com.job.enums.Status;

public interface ReferralRepository extends JpaRepository<Referral, Long>, JpaSpecificationExecutor<Referral> {

    boolean existsByCandidateEmailAndJobId(String email, Long jobId);

    List<Referral> findByEmployeeId(Long employeeId);

    Page<Referral> findByEmployeeEmail(String email, Pageable pageable);

    long countByStatus(Status status);

    long countByEmployeeEmail(String email);

    long countByEmployeeEmailAndStatus(String email, Status status);
}
