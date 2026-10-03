package com.luxtech.booking.dto;

import com.luxtech.booking.entity.Facture;
import com.luxtech.booking.entity.Reservation;
import com.luxtech.booking.entity.ReservationService;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class BookingDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateReservationRequest {
        @NotNull Long hotelId;
        Long chambreId;
        Long chambreTypeId;
        Long agencyId;
        @NotBlank String clientNom;
        String clientPrenom;
        String clientEmail;
        String clientTelephone;
        String clientNationalite;
        String clientCinPasseport;
        @NotNull LocalDate dateArrivee;
        @NotNull LocalDate dateDepart;
        Integer nbAdultes;
        Integer nbEnfants;
        BigDecimal prixTotal;
        Reservation.ReservationSource source;
        String notes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReservationResponse {
        Long id; String numeroReservation;
        Long hotelId; Long chambreId; Long chambreTypeId; Long userId; Long agencyId;
        String clientNom; String clientPrenom; String clientEmail; String clientTelephone;
        String clientNationalite; String clientCinPasseport;
        LocalDate dateArrivee; LocalDate dateDepart; Integer nbNuits;
        Integer nbAdultes; Integer nbEnfants;
        BigDecimal prixChambreNuit; BigDecimal prixHt; BigDecimal prixTotal;
        BigDecimal montantTva; BigDecimal montantCommission; BigDecimal montantReverse;
        BigDecimal montantPaye;
        Reservation.ReservationStatus status; Reservation.PaymentStatus paymentStatus;
        Reservation.ReservationSource source;
        Reservation.CancellationRequestStatus annulationDemandeStatut;
        String annulationDemandeMotif; LocalDateTime annulationDemandeAt;
        String annulationRefusMotif;
        String notes;
        LocalDateTime createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CancellationRequest {
        String motif;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CancellationDecisionRequest {
        @NotNull Boolean acceptee;
        String motifRefus;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaiementRequest {
        @NotNull BigDecimal montant;
        Facture.MethodePaiement methode;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class FactureResponse {
        Long id; String numeroFacture;
        Long reservationId; Long hotelId; Long agenceId;
        BigDecimal montantTotal; BigDecimal montantHt; BigDecimal montantTva; BigDecimal montantCommission;
        Facture.TypeFacture typeFacture; Facture.StatutFacture statut; Facture.MethodePaiement methodePaiement;
        LocalDate dateFacture; LocalDate dateEcheance;
        LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateReservationServiceRequest {
        Long reservationId;
        @NotNull Long hotelId;
        @NotNull Long serviceId;
        String clientNom;
        String clientEmail;
        String clientTelephone;
        @NotNull LocalDate serviceDate;
        LocalTime serviceHeure;
        Integer quantite;
        String notes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReservationServiceResponse {
        Long id; Long serviceId; String serviceNom; BigDecimal prixUnitaire;
        Long hotelId; Long reservationId;
        String clientNom; String clientEmail; String clientTelephone;
        LocalDate serviceDate; LocalTime serviceHeure; Integer quantite;
        BigDecimal prixTotal; BigDecimal montantPaye;
        ReservationService.StatutReservationService statut;
        ReservationService.StatutPaiementService statutPaiement;
        ReservationService.MethodePaiementService methodePaiement;
        String notes;
        LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaiementServiceRequest {
        @NotNull BigDecimal montant;
        ReservationService.MethodePaiementService methode;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DisponibiliteTypeResponse {
        Long chambreTypeId;
        String nom;
        String description;
        String imagesUrls;
        BigDecimal prixBase;
        Integer nbDisponibles;
        Integer capaciteAdultes;
        Integer capaciteEnfants;
        String amenities;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PublicReservationRequest {
        @NotNull Long hotelId;
        @NotNull Long chambreTypeId;
        @NotNull LocalDate dateArrivee;
        @NotNull LocalDate dateDepart;
        @NotBlank String clientNom;
        String clientPrenom;
        @Email @NotBlank String clientEmail;
        String clientTelephone;
        String clientNationalite;
        String clientCinPasseport;
        Integer nbAdultes;
        Integer nbEnfants;
        String notes;
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
