package com.luxpure.chatbotservice.dto;

import lombok.*;
import java.util.List;

public class ChatDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChatMessage {
        String role;
        String content;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChatRequest {
        String message;
        List<ChatMessage> history;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChatResponse {
        String reply;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse<T> {
        boolean success; String message; T data;
        public static <T> ApiResponse<T> ok(String msg, T data) {
            return ApiResponse.<T>builder().success(true).message(msg).data(data).build();
        }
        public static <T> ApiResponse<T> error(String msg) {
            return ApiResponse.<T>builder().success(false).message(msg).build();
        }
    }
}