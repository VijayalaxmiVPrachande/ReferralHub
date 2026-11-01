package com.job.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.job.entity.ReferralEmail;

public interface ReferralEmailRepository extends JpaRepository<ReferralEmail, Long> {
    List<ReferralEmail> findByReferralIdOrderBySentAtDesc(Long referralId);
}
