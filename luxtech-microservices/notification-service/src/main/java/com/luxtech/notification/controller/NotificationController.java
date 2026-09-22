package com.luxtech.notification.controller;

import com.luxtech.notification.entity.Notification;
import com.luxtech.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestHeader("X-User-Id") String userId) {
        List<Notification> list =
                notificationService.getByUser(Long.parseLong(userId));
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", list));
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<String, Object>> getUnread(
            @RequestHeader("X-User-Id") String userId) {
        List<Notification> list =
                notificationService.getNonLues(Long.parseLong(userId));
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", list));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Object>> countUnread(
            @RequestHeader("X-User-Id") String userId) {
        long count = notificationService.countNonLues(Long.parseLong(userId));
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", count));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> marquerLue(
            @PathVariable("id") Long id) {
        Notification n = notificationService.marquerLue(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", n));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Object>> marquerToutesLues(
            @RequestHeader("X-User-Id") String userId) {
        notificationService.marquerToutesLues(Long.parseLong(userId));
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Toutes marquees comme lues"));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("notification-service UP");
    }
}