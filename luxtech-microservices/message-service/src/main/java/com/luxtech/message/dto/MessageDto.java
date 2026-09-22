package com.luxtech.message.dto;

import com.luxtech.message.entity.Message;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class MessageDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EnvoyerMessageRequest {
        @NotNull Long destinataireId;
        String destinataireNom;
        @NotBlank String sujet;
        @NotBlank String contenu;
        Long parentId;
        String conversationId;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RepondreRequest {
        @NotNull Long parentId;
        @NotBlank String contenu;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MessageResponse {
        Long id;
        Long expediteurId;
        String expediteurNom;
        String expediteurRole;
        Long destinataireId;
        String destinataireNom;
        String destinataireRole;
        String sujet;
        String contenu;
        Boolean isLu;
        LocalDateTime dateLecture;
        Long parentId;
        String conversationId;
        Message.MessageType type;
        Boolean isArchiveExpediteur;
        Boolean isArchiveDestinataire;
        String pieceJointeUrl;
        String pieceJointeNom;
        Long hebergementId;
        Long reservationId;
        String clientNom;
        String clientEmail;
        String clientTelephone;
        LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ConversationResponse {
        String conversationId;
        Long autreUserId;
        String autreUserNom;
        String autreUserRole;
        String dernierMessage;
        String dernierSujet;
        LocalDateTime dateDernierMessage;
        long nonLus;
        List<MessageResponse> messages;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BoiteReceptionResponse {
        List<ConversationResponse> conversations;
        long totalNonLus;
    }

    // ── Communication avec un client ──────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class EnvoyerMessageClientRequest {
        @NotNull Long hebergementId;
        Long reservationId;
        @NotBlank String clientNom;
        String clientEmail;
        String clientTelephone;
        String sujet;
        @NotBlank String contenu;
        @NotNull Boolean deLaPartDuClient;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse<T> {
        boolean success;
        String message;
        T data;

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