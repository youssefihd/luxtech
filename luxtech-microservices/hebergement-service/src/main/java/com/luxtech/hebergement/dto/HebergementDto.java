package com.luxtech.hebergement.dto;

import com.luxtech.hebergement.entity.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

public class HebergementDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateHebergementRequest {
        @NotBlank String nom;
        String nomLegal;
        String numeroFiscal;
        String description;
        @NotBlank String adresse;
        @NotBlank String ville;
        @NotBlank String pays;
        String codePostal;
        String telephone;
        @Email String email;
        String website;
        Integer etoiles;
        String heureCheckin;
        String heureCheckout;
        String devise;
        List<PhotoResponse> photos;
        List<DocumentResponse> documents;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class HebergementResponse {
        Long id; String nom; String nomLegal; String description;
        String adresse; String ville; String pays; String codePostal;
        String telephone; String email; String website;
        Integer etoiles; String slug;
        Hebergement.HebergementStatus status; Boolean isActive;
        String heureCheckin; String heureCheckout; String devise;
        String logoUrl; Long userId; String iban;
        String numeroFiscal; String rc; String patente; String cnss; String ice;
        Double latitude; Double longitude;
        String equipements; BigDecimal commissionTaux;String servicesInclus;
        Boolean bookingEngineActif; String bookingEngineDescription; String bookingPageConfig;        LocalDateTime createdAt;
        List<ChambreTypeResponse> chambreTypes;
        List<PhotoResponse> photos;
        List<DocumentResponse> documents;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PhotoResponse {
        Long id;
        String url;
        String nomFichier;
        Integer ordre;
        Boolean estPrincipale;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DocumentResponse {
        Long id;
        String typeDocument;
        String url;
        String nomFichier;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateChambreTypeRequest {
        @NotBlank String nom;
        String description;
        @NotNull BigDecimal prixBase;
        Integer capaciteAdultes;
        Integer capaciteEnfants;
        String amenities;
        Integer ordreAffichage;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateChambreTypeRequest {
        String nom;
        String description;
        BigDecimal prixBase;
        Integer capaciteAdultes;
        Integer capaciteEnfants;
        String amenities;
        Integer ordreAffichage;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChambreTypeResponse {
        Long id; String nom; String description;
        BigDecimal prixBase; Integer capaciteAdultes; Integer capaciteEnfants;
        String amenities; String imagesUrls; Integer ordreAffichage;
        Long hotelId; int nombreChambres;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateBookingEngineRequest {
        Boolean actif;
        String description;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateChambreRequest {
        @NotBlank String numero;
        Integer etage;
        @NotNull Long chambreTypeId;
        String notes;
        Integer capacite;
        BigDecimal prixNuitee;
        BigDecimal superficie;
        String equipements;
        Chambre.ChambreStatus statut;
        Integer dureeMinutes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateChambreRequest {
        String numero;
        Integer etage;
        Long chambreTypeId;
        String notes;
        Integer capacite;
        BigDecimal prixNuitee;
        BigDecimal superficie;
        String equipements;
        Chambre.ChambreStatus statut;
        Integer dureeMinutes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChambreResponse {
        Long id; String numero; Integer etage;
        Chambre.ChambreStatus status; Boolean isActive;
        String notes; Long chambreTypeId; String chambreTypeNom;
        String chambreTypeDescription;
        String chambreTypeImagesUrls;
        BigDecimal prixBase;
        Integer capacite; BigDecimal prixNuitee; BigDecimal superficie;
        String imageUrl; String equipements;
        Integer capaciteAdultes; Integer capaciteEnfants; String amenities;
        LocalDateTime statusChangedAt; Integer statusDureeMinutes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateServiceRequest {
        @NotBlank String nom;
        String description;
        @NotBlank String categorie;
        @NotNull BigDecimal prix;
        Integer duree;
        Integer capaciteMax;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateServiceRequest {
        String nom;
        String description;
        String categorie;
        BigDecimal prix;
        Integer duree;
        Integer capaciteMax;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ServiceResponse {
        Long id; String nom; String description; String categorie;
        BigDecimal prix; Integer duree; Integer capaciteMax;
        String imageUrl; Boolean isActive; Long hotelId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateTarifSaisonnierRequest {
        @NotBlank String nom;
        Long chambreTypeId;
        Long chambreId;
        @NotNull LocalDate dateDebut;
        @NotNull LocalDate dateFin;
        @NotNull TarifSaisonnier.TypeAjustement typeAjustement;
        @NotNull BigDecimal valeurAjustement;
        Integer priorite;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateTarifSaisonnierRequest {
        String nom;
        Long chambreTypeId;
        Long chambreId;
        LocalDate dateDebut;
        LocalDate dateFin;
        TarifSaisonnier.TypeAjustement typeAjustement;
        BigDecimal valeurAjustement;
        Integer priorite;
        Boolean isActive;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TarifSaisonnierResponse {
        Long id; String nom;
        Long chambreTypeId; String chambreTypeNom;
        Long chambreId; String chambreNumero;
        LocalDate dateDebut; LocalDate dateFin;
        TarifSaisonnier.TypeAjustement typeAjustement;
        BigDecimal valeurAjustement;
        Integer priorite; Boolean isActive;
        Long hotelId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CompleteProfileRequest {
        private List<ChambreData> chambres;
        private InfosFinancieres infosFinancieres;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateBookingPageConfigRequest {
        @NotBlank String bookingPageConfig;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ChambreData {
        private String type;
        private Integer nbChambres;
        private Map<String, Integer> lits;
        private Integer capacite;
        private String superficie;
        private Boolean fumeurs;
        private Boolean salleBainPrivee;
        private List<String> equipSalleBain;
        private List<String> equipChambre;
        private String tarif;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class InfosFinancieres {
        private String iban;
        private String nomBanque;
        private String nomTitulaire;
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
    public static class UpdateCommissionRequest {
        @NotNull BigDecimal commissionTaux;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateActivityLogRequest {
        Long userId;
        String userNom;
        @NotNull ActivityLog.Action action;
        @NotBlank String entite;
        @NotBlank String description;
        String details;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ActivityLogResponse {
        Long id; Long hotelId; Long userId; String userNom;
        ActivityLog.Action action; String entite;
        String description; String details;
        LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateHebergementInfoRequest {
        String nom;
        String nomLegal;
        String description;
        String adresse;
        String ville;
        String pays;
        String codePostal;
        String telephone;
        String email;
        String website;
        Integer etoiles;
        String heureCheckin;
        String heureCheckout;
        String numeroFiscal;
        String rc;
        String patente;
        String cnss;
        String ice;
        String iban;
        Double latitude;
        Double longitude;
        String equipements;
        String servicesInclus;
    }

}