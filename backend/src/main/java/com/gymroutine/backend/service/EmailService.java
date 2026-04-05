package com.gymroutine.backend.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendVerificationEmail(String toEmail, String otp) {
        String verificationMessage = "Your verification OTP is: " + otp;

        System.out.println("=========================================================");
        System.out.println("SIMULATED EMAIL SENT TO: " + toEmail);
        System.out.println("SUBJECT: Verify your GYM-JAM Account");
        System.out.println("BODY:");
        System.out.println("Welcome to GYM-JAM! Please use the following 6-digit OTP code to verify your email:");
        System.out.println(otp);
        System.out.println("=========================================================");

        try {
            java.nio.file.Files.writeString(
                    java.nio.file.Paths.get("verification.txt"),
                    verificationMessage);
        } catch (java.io.IOException e) {
            e.printStackTrace();
        }
    }
}
