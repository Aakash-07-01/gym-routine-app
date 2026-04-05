package com.gymroutine.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("gym-routine@no-reply.com");
            message.setTo(toEmail);
            message.setSubject("Verify your GYM-JAM Account");
            message.setText("Welcome to GYM-JAM!\n\nPlease use the following 6-digit OTP code to verify your email:\n\n"
                    + otp + "\n\nThis code is valid for 10 minutes.");

            mailSender.send(message);
            System.out.println("Real SMTP Email Sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send real SMTP email. " + e.getMessage());
            // Fallback for testing environments if mail is unconfigured:
            try {
                java.nio.file.Files.writeString(
                        java.nio.file.Paths.get("verification.txt"),
                        "Your verification OTP is: " + otp);
            } catch (Exception ex) {
            }
        }
    }
}
