package com.luxtech.notification.service;

import com.luxtech.notification.entity.Notification;
import com.luxtech.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

    private final NotificationRepository notificationRepository;
    private final NotificationService    notificationService;

    @RabbitListener(queues = "luxtech.notifications")
    public void handleEvent(Map<String, Object> event) {
        try {
            log.info("Evenement recu : {}", event);

            String type    = (String) event.getOrDefault("type", "INFO");
            String titre   = (String) event.getOrDefault("titre", "Notification");
            String message = (String) event.getOrDefault("message", "");
            Object userIdObj = event.get("userId");
            String email = (String) event.get("email");

            // Notification interne uniquement si un userId reel est present
            if (userIdObj != null) {
                Long userId = Long.parseLong(userIdObj.toString());
                notificationService.create(userId, titre, message, type);
            }

            // Envoi d'email — independant du userId (couvre aussi les clients externes)
            if (email != null && !email.isBlank()) {
                notificationService.envoyerEmail(email, titre, message);
            }

            if (userIdObj == null && (email == null || email.isBlank())) {
                log.warn("Evenement sans userId ni email, rien a faire : {}", event);
            }

        } catch (Exception e) {
            log.error("Erreur traitement notification : {}", e.getMessage());
        }
    }
}