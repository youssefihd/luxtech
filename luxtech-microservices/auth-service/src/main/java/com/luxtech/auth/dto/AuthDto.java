package com.luxtech.auth.dto;

import com.luxtech.auth.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class AuthDto {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank String nom;
        @NotBlank String prenom;
        @Email @NotBlank String email;
        @NotBlank @Size(min = 8) String password;
        String telephone;
        @NotNull User.UserRole role;
        Long hotelId;
        Long agencyId;
        String typeHebergement;
        String nomEtablissement;
        String ville;
        String adresse;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @Email @NotBlank String email;
        @NotBlank String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UpdateUserRequest {
        String nom;
        String prenom;
        String telephone;
        String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        String accessToken;
        String tokenType;
        Long expiresIn;
        UserResponse user;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserResponse {
        Long id;
        String nom;
        String prenom;
        String email;
        String telephone;
        User.UserRole role;
        User.UserStatus status;
        Boolean isActive;
        LocalDateTime emailVerifiedAt;
        Long hotelId;
        Long agencyId;
        String typeHebergement;
        String nomEtablissement;
        String ville;
        String adresse;
        String poste;
        LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateEmployeeRequest {
        @NotBlank String nom;
        @NotBlank String prenom;
        @Email @NotBlank String email;
        String telephone;
        @NotBlank String password;
        String poste;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateEmployeeRequest {
        String nom;
        String prenom;
        String telephone;
        String poste;
        String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse<T> {
        boolean success;
        String message;
        T data;

        public static <T> ApiResponse<T> ok(String msg, T data) {
            return ApiResponse.<T>builder().success(true).message(msg).data(data).build();
        }

        public static <T> ApiResponse<T> error(String msg) {
            return ApiResponse.<T>builder().success(false).message(msg).build();
        }
    }
}