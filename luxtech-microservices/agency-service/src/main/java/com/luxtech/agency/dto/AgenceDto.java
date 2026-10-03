package com.luxtech.agency.dto;
import com.luxtech.agency.entity.Agence;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalDate;

public class AgenceDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateAgenceRequest {
        @NotBlank String nomAgence;
        @NotBlank String raisonSociale;
        String nomCommercial;
        String ice; String patente;
        String numeroFiscal; String licenceVoyage; String rc;
        @Email String email;
        String telephone; String telephone2; String fax; String adresse;
        String ville; String pays; String codePostal; String website;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AgenceResponse {
        Long id; String nomAgence; String raisonSociale;
        String nomCommercial; String ice; String patente; String numeroFiscal; String licenceVoyage; String rc;
        String email; String telephone; String telephone2; String fax; String adresse;
        String ville; String pays; String codePostal; String website;
        java.math.BigDecimal commissionTaux; java.math.BigDecimal plafondCredit; java.math.BigDecimal soldeActuel;
        Boolean creditEnabled;
        Agence.AgenceStatus status; Long userId; String logoUrl;
        LocalDateTime createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AgencyCommercialSettingsRequest {
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") java.math.BigDecimal commissionTaux;
        @NotNull @DecimalMin("0.00") java.math.BigDecimal plafondCredit;
        @NotNull Boolean creditEnabled;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ClientRequest {
        @NotBlank @Size(max = 100) String nom;
        @NotBlank @Size(max = 100) String prenom;
        @Email @Size(max = 150) String email;
        @Size(max = 30) String telephone;
        @Size(max = 80) String nationalite;
        LocalDate dateNaissance;
        @Size(max = 300) String adresse;
        String preferences;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ClientResponse {
        Long id; Long agenceId; String nom; String prenom; String email;
        String telephone; String nationalite; LocalDate dateNaissance;
        String adresse; String preferences; LocalDateTime createdAt;
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
