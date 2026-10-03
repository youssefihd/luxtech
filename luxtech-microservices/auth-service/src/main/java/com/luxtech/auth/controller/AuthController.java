package com.luxtech.auth.controller;

import com.luxtech.auth.dto.AuthDto;
import com.luxtech.auth.entity.User;
import com.luxtech.auth.service.AuthService;
import com.luxtech.auth.service.VerificationCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final VerificationCodeService verificationCodeService;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.ApiResponse<AuthDto.UserResponse>> register(
            @Valid @RequestBody AuthDto.RegisterRequest req) {
        AuthDto.UserResponse saved = authService.register(req).getData();
        return ResponseEntity.status(201)
                .body(AuthDto.ApiResponse.ok("Inscription envoyée. En attente de validation.", saved));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.ApiResponse<AuthDto.AuthResponse>> login(
            @Valid @RequestBody AuthDto.LoginRequest req) {
        return ResponseEntity.ok(AuthDto.ApiResponse.ok("Connexion réussie.", authService.login(req)));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthDto.ApiResponse<AuthDto.UserResponse>> me(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(AuthDto.ApiResponse.ok("OK",
                authService.toUserResponse(authService.findById(Long.parseLong(userId)))));
    }

    @PutMapping("/me")
    public ResponseEntity<AuthDto.ApiResponse<AuthDto.UserResponse>> updateMe(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody AuthDto.UpdateUserRequest req) {
        return ResponseEntity.ok(AuthDto.ApiResponse.ok("Profil mis à jour.",
                authService.toUserResponse(authService.updateUser(Long.parseLong(userId), req))));
    }

    @GetMapping("/admin/users")
    public ResponseEntity<AuthDto.ApiResponse<List<AuthDto.UserResponse>>> allUsers(
            @RequestParam(required = false) User.UserRole role,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(AuthDto.ApiResponse.ok("OK",
                authService.searchUsers(role, search).stream().map(authService::toUserResponse).toList()));
    }

    @GetMapping("/admin/users/pending")
    public ResponseEntity<AuthDto.ApiResponse<List<AuthDto.UserResponse>>> pending() {
        return ResponseEntity.ok(AuthDto.ApiResponse.ok("OK",
                authService.getPendingUsers().stream().map(authService::toUserResponse).toList()));
    }

    @PutMapping("/admin/users/{id}/approve")
    public ResponseEntity<AuthDto.ApiResponse<AuthDto.UserResponse>> approve(@PathVariable("id") Long id) {
        return ResponseEntity.ok(AuthDto.ApiResponse.ok("Approuvé.",
                authService.toUserResponse(authService.approveUser(id))));
    }

    @PutMapping("/admin/users/{id}/reject")
    public ResponseEntity<AuthDto.ApiResponse<AuthDto.UserResponse>> reject(@PathVariable("id") Long id) {
        return ResponseEntity.ok(AuthDto.ApiResponse.ok("Refusé.",
                authService.toUserResponse(authService.rejectUser(id))));
    }

    @PutMapping("/admin/users/{id}/suspend")
    public ResponseEntity<AuthDto.ApiResponse<AuthDto.UserResponse>> suspend(@PathVariable("id") Long id) {
        return ResponseEntity.ok(AuthDto.ApiResponse.ok("Suspendu.",
                authService.toUserResponse(authService.suspendUser(id))));
    }

    @PostMapping("/send-verification-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email requis"));
            }
            verificationCodeService.sendCode(email);
            return ResponseEntity.ok(Map.of(
                    "message", "Code envoyé à " + email,
                    "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Erreur lors de l'envoi : " + e.getMessage()));
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String code  = body.get("code");
            if (email == null || code == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email et code requis"));
            }
            boolean valid = verificationCodeService.verifyCode(email, code.trim());
            if (valid) {
                return ResponseEntity.ok(Map.of(
                        "valid", true,
                        "message", "Code vérifié avec succès"
                ));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "valid", false,
                                "message", "Code invalide ou expiré"
                        ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Erreur de vérification : " + e.getMessage()));
        }
    }
    @PostMapping("/hebergements/{hebergementId}/employees")
    public ResponseEntity<AuthDto.ApiResponse<AuthDto.UserResponse>> createEmployee(
            @PathVariable("hebergementId") Long hebergementId,
            @Valid @RequestBody AuthDto.CreateEmployeeRequest req) {
        User saved = authService.createEmployee(hebergementId, req);
        return ResponseEntity.status(201).body(AuthDto.ApiResponse.ok("Employe cree.", authService.toUserResponse(saved)));
    }

    @GetMapping("/hebergements/{hebergementId}/employees")
    public ResponseEntity<AuthDto.ApiResponse<List<AuthDto.UserResponse>>> getEmployees(
            @PathVariable("hebergementId") Long hebergementId) {
        return ResponseEntity.ok(AuthDto.ApiResponse.ok("OK",
                authService.getUsersByHebergement(hebergementId).stream().map(authService::toUserResponse).toList()));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<AuthDto.ApiResponse<AuthDto.UserResponse>> updateEmployee(
            @PathVariable("id") Long id, @Valid @RequestBody AuthDto.UpdateEmployeeRequest req) {
        return ResponseEntity.ok(AuthDto.ApiResponse.ok("Employe mis a jour.",
                authService.toUserResponse(authService.updateEmployee(id, req))));
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<AuthDto.ApiResponse<Void>> deleteEmployee(@PathVariable("id") Long id) {
        authService.deleteEmployee(id);
        return ResponseEntity.ok(AuthDto.ApiResponse.ok("Employe supprime.", null));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("auth-service UP");
    }
}
