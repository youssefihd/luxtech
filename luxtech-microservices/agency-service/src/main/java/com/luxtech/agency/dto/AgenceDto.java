package com.luxtech.agency.dto;
import com.luxtech.agency.entity.Agence;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

public class AgenceDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateAgenceRequest {
        @NotBlank String nomAgence;
        @NotBlank String raisonSociale;
        String ice; String patente;
        @Email String email;
        String telephone; String adresse;
        String ville; String pays;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AgenceResponse {
        Long id; String nomAgence; String raisonSociale;
        String ice; String patente; String email;
        String telephone; String adresse; String ville; String pays;
        Agence.AgenceStatus status; Long userId; String logoUrl;
        LocalDateTime createdAt;
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
