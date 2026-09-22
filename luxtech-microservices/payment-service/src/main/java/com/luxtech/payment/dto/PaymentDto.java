package com.luxtech.payment.dto;
import com.luxtech.payment.entity.Abonnement;
import com.luxtech.payment.entity.Paiement;
import com.luxtech.payment.entity.Reversement;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PaymentDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreatePaymentIntentRequest {
        @NotNull Long reservationId;
        @NotNull @DecimalMin("1.0") BigDecimal montant;
        String currency;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ManualPaymentRequest {
        Long reservationId;
        Long reservationServiceId;
        @NotNull Long hotelId;
        String clientNom;
        @NotNull @DecimalMin("1.0") BigDecimal montant;
        @NotNull Paiement.ModePaiement modePaiement;
        String notes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ConfirmPaymentRequest {
        @NotBlank String paymentIntentId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaymentIntentResponse {
        String clientSecret;
        String paymentIntentId;
        BigDecimal montant;
        String currency;
        Long paiementId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaiementResponse {
        Long id;
        Long reservationId; Long reservationServiceId; Long abonnementId; Long hotelId; Long clientId;
        String clientNom;
        BigDecimal montant;
        Paiement.ModePaiement modePaiement;
        Paiement.PaiementStatus status;
        String stripePaymentIntentId;
        String reference; String notes;
        LocalDateTime datePaiement; LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateAbonnementRequest {
        @NotNull Long hotelId;
        @NotNull Abonnement.Plan plan;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AbonnementResponse {
        Long id; Long hotelId;
        Abonnement.Plan plan; BigDecimal prix;
        Abonnement.Statut statut;
        LocalDate dateDebut; LocalDate dateExpiration;
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

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateReversementRequest {
        @NotNull Long hotelId;
        @NotNull BigDecimal montantBrut;
        @NotNull BigDecimal montantCommission;
        @NotNull BigDecimal montantNet;
        @NotNull LocalDate periodeDebut;
        @NotNull LocalDate periodeFin;
        Integer nbReservations;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReversementResponse {
        Long id; Long hotelId;
        BigDecimal montantBrut; BigDecimal montantCommission; BigDecimal montantNet;
        LocalDate periodeDebut; LocalDate periodeFin;
        Reversement.StatutReversement statut;
        LocalDateTime dateReversement; String referenceVirement;
        Integer nbReservations;
        LocalDateTime createdAt;
    }
}