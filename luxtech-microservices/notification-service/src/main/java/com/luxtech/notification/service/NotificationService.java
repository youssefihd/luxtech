package com.luxtech.notification.service;

import com.luxtech.notification.entity.Notification;
import com.luxtech.notification.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final Optional<JavaMailSender> mailSender;

    public NotificationService(
            NotificationRepository notificationRepository,
            Optional<JavaMailSender> mailSender) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    // ── Créer une notification ────────────────────────────────
    public Notification create(Long userId, String titre,
                               String message, String type) {
        Notification n = Notification.builder()
                .userId(userId)
                .titre(titre)
                .message(message)
                .type(type)
                .isLu(false)
                .build();
        return notificationRepository.save(n);
    }

    // ── Lire ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Notification> getByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getNonLues(Long userId) {
        return notificationRepository.findByUserIdAndIsLuFalse(userId);
    }

    @Transactional(readOnly = true)
    public long countNonLues(Long userId) {
        return notificationRepository.countByUserIdAndIsLuFalse(userId);
    }

    // ── Actions ───────────────────────────────────────────────
    public Notification marquerLue(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));
        n.setIsLu(true);
        n.setDateLecture(LocalDateTime.now());
        return notificationRepository.save(n);
    }

    public void marquerToutesLues(Long userId) {
        List<Notification> list =
                notificationRepository.findByUserIdAndIsLuFalse(userId);
        list.forEach(n -> {
            n.setIsLu(true);
            n.setDateLecture(LocalDateTime.now());
        });
        notificationRepository.saveAll(list);
    }

    // ── Email ─────────────────────────────────────────────────
    public void envoyerEmail(String to, String subject, String body) {
        if (mailSender.isEmpty()) {
            log.warn("JavaMailSender non configure — email non envoye a {}", to);
            return;
        }
        try {
            var mimeMessage = mailSender.get().createMimeMessage();
            var helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.get().send(mimeMessage);
            log.info("Email envoye a {}", to);
        } catch (Exception e) {
            log.warn("Erreur envoi email : {}", e.getMessage());
        }
    }
}