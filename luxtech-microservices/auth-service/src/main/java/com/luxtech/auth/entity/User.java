package com.luxtech.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity @Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_utilisateur") private Long id;
    @NotBlank @Column(nullable = false, length = 100) private String nom;
    @NotBlank @Column(nullable = false, length = 100) private String prenom;
    @Email @NotBlank @Column(unique = true, nullable = false, length = 150) private String email;
    @Column(length = 20) private String telephone;
    @NotBlank @Column(nullable = false) private String password;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private UserRole role;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) @Builder.Default private UserStatus status = UserStatus.PENDING_APPROVAL;
    @Column(name = "is_active") @Builder.Default private Boolean isActive = false;
    @Column(name = "email_verified_at") private LocalDateTime emailVerifiedAt;
    @Column(name = "hebergement_id") private Long hebergementId;
    @Column(name = "agency_id") private Long agencyId;
    @Column(name = "type_hebergement", length = 50) private String typeHebergement;
    @Column(name = "nom_etablissement", length = 200) private String nomEtablissement;
    @Column(name = "ville", length = 100) private String ville;
    @Column(name = "adresse", length = 255) private String adresse;
    @Column(name = "poste", length = 50) private String poste;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;

    public enum UserRole {
        SUPER_ADMIN, HEBERGEMENT_ADMIN, HEBERGEMENT_STAFF, AGENCY_ADMIN, AGENCY_STAFF, CLIENT
    }
    public enum UserStatus { PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED }
    public boolean isApproved() { return this.status == UserStatus.APPROVED && Boolean.TRUE.equals(this.isActive); }
}