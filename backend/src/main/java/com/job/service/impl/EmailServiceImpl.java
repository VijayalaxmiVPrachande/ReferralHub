package com.job.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.job.service.EmailService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Override
    public void sendMail(String to, String subject, String body) {
        sendMail(to, subject, body, null);
    }

    @Override
    public void sendMail(String to, String subject, String body, String[] cc) {
        if (mailSender == null) {
            log.info("JavaMailSender not configured. Skipping email to {} with subject: {}", to, subject);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            String from = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "noreply@referralhub.com";
            message.setFrom(from);
            message.setTo(to);
            if (cc != null && cc.length > 0) {
                message.setCc(cc);
            }
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw e;
        }
    }

    @Async
    public void sendAsyncAcknowledgement(String to, String subject, String body) {
        try {
            sendMail(to, subject, body);
        } catch (Exception e) {
            log.warn("Async email acknowledgement delivery failed to {}: {}", to, e.getMessage());
        }
    }
}