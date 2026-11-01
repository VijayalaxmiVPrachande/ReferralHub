package com.job;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class JobReferralAndInternalHiringPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobReferralAndInternalHiringPlatformApplication.class, args);
	}

}
