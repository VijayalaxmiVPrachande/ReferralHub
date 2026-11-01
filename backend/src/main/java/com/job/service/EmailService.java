package com.job.service;

public interface EmailService {
    void sendMail(String to, String subject, String body);
    void sendMail(String to, String subject, String body, String[] cc);
}
