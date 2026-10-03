package com.luxtech.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationCodeService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderAddress;

    @Value("${spring.mail.host:NOT_SET}")
    private String mailHost;

    @Value("${spring.mail.port:NOT_SET}")
    private String mailPort;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    private final Map<String, String> codes = new ConcurrentHashMap<>();

    public void sendCode(String email) {

        log.info("========== SMTP EMAIL START ==========");
        log.info("Preparing verification email");
        log.info("SMTP host: {}", mailHost);
        log.info("SMTP port: {}", mailPort);
        log.info("SMTP username: {}", senderAddress);
        log.info("SMTP password configured: {}",
                mailPassword != null && !mailPassword.isBlank());

        String code = String.format("%06d", new Random().nextInt(1_000_000));

        codes.put(email, code);

        log.info("Verification code generated for email: {}", email);
        log.info("Code: {}", code);

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderAddress);
        message.setTo(email);
        message.setSubject("LuxTech - Code de vérification");

        message.setText(
                "Bonjour,\n\n" +
                        "Merci de rejoindre LuxTech, la plateforme de gestion hôtelière marocaine.\n\n" +
                        "Votre code de vérification est :\n\n" +
                        "        " + code + "\n\n" +
                        "Ce code est valable 10 minutes.\n" +
                        "Si vous n'avez pas demandé ce code, ignorez cet email.\n\n" +
                        "Cordialement,\n" +
                        "L'équipe LuxTech\n" +
                        "contact@luxtech.ma"
        );

        log.info("Email prepared:");
        log.info("From: {}", senderAddress);
        log.info("To: {}", email);
        log.info("Subject: {}", message.getSubject());

        try {

            log.info("Calling JavaMailSender.send()...");

            mailSender.send(message);

            log.info("SMTP EMAIL SENT SUCCESSFULLY");
            log.info("Email successfully sent to {}", email);
            log.info("========== SMTP EMAIL END ==========");

        } catch (Exception e) {

            log.error("========== SMTP EMAIL FAILED ==========");
            log.error("Email sending failed");
            log.error("SMTP host: {}", mailHost);
            log.error("SMTP port: {}", mailPort);
            log.error("SMTP username: {}", senderAddress);
            log.error("SMTP password configured: {}",
                    mailPassword != null && !mailPassword.isBlank());
            log.error("Recipient: {}", email);
            log.error("Exception type: {}", e.getClass().getName());
            log.error("Exception message: {}", e.getMessage());

            // Very important: print the complete underlying SMTP exception
            log.error("Full SMTP exception:", e);

            log.error("========== SMTP EMAIL END WITH ERROR ==========");

            throw e;
        }
    }

    public boolean verifyCode(String email, String code) {

        String stored = codes.get(email);

        if (stored != null && stored.equals(code)) {

            codes.remove(email);

            log.info("Verification successful for {}", email);

            return true;
        }

        log.warn(
                "Invalid verification code for {} - expected: {}, received: {}",
                email,
                stored,
                code
        );

        return false;
    }
}