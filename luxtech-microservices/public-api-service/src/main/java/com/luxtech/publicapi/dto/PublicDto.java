package com.luxtech.publicapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

public class PublicDto {

    @Getter @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchRequest {
        String   ville;
        LocalDate dateArrivee;
        LocalDate dateDepart;
        Integer  nbAdultes;
        Integer  nbEnfants;
        Double   prixMin;
        Double   prixMax;
        Integer  etoilesMin;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingRequest {
        @NotNull  Long      hotelId;
        Long                chambreTypeId;
        Long                chambreId;
        @NotBlank String    clientNom;
        @NotBlank String    clientPrenom;
        @Email @NotBlank String clientEmail;
        String              clientTelephone;
        @NotNull LocalDate  dateArrivee;
        @NotNull LocalDate  dateDepart;
        @Min(1)  Integer    nbAdultes;
        Integer             nbEnfants;
        String              notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
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