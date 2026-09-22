package com.luxtech.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    // Stockage en mémoire : email -> code
    private final Map<String, String> codes = new ConcurrentHashMap<>();

    /**
     * Génère un code à 6 chiffres et l'envoie par email
     */
    public void sendCode(String email) {
        String code = String.format("%06d", new Random().nextInt(999999));
        codes.put(email, code);
        log.info("Code généré pour {} : {}", email, code);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("sarafallahi59@gmail.com");
        message.setTo(email);
        message.setSubject("LuxTech — Code de vérification");
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

        mailSender.send(message);
        log.info("Email envoyé à {}", email);
    }

    /**
     * Vérifie le code saisi par l'utilisateur
     */
    public boolean verifyCode(String email, String code) {
        String stored = codes.get(email);
        if (stored != null && stored.equals(code)) {
            codes.remove(email);
            log.info("Code vérifié avec succès pour {}", email);
            return true;
        }
        log.warn("Code invalide pour {} — attendu: {}, reçu: {}", email, stored, code);
        return false;
    }
}