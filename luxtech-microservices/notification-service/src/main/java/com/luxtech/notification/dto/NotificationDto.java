package com.luxtech.notification.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class NotificationDto {

    // ── Reponses ──────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NotificationResponse {
        Long          id;
        Long          userId;
        String        titre;
        String        message;
        String        type;
        Boolean       isLu;
        LocalDateTime dateLecture;
        Long          referenceId;
        String        referenceType;
        LocalDateTime createdAt;
    }

    // ── Reponse generique ─────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse<T> {
        boolean success;
        String  message;
        T       data;

        public static <T> ApiResponse<T> ok(String msg, T data) {
            return ApiResponse.<T>builder()
                    .success(true).message(msg).data(data).build();
        }

        public static <T> ApiResponse<T> error(String msg) {
            return ApiResponse.<T>builder()
                    .success(false).message(msg).build();
        }
    }
}