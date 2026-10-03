package com.luxtech.agency.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "agences")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Agence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Informations de base ──────────────────────────────────
    @NotBlank
    @Column(name = "nom_agence", nullable = false, length = 200)
    private String nomAgence;

    @NotBlank
    @Column(name = "raison_sociale", nullable = false, length = 200)
    private String raisonSociale;

    @Column(name = "nom_commercial", length = 200)
    private String nomCommercial;

    // ── Documents légaux ──────────────────────────────────────
    @Column(name = "ice", length = 20)
    private String ice;

    @Column(name = "patente", length = 20)
    private String patente;

    @Column(name = "numero_fiscal", length = 50)
    private String numeroFiscal;

    @Column(name = "licence_voyage", length = 100)
    private String licenceVoyage;

    @Column(name = "rc", length = 50)
    private String rc;

    // ── Coordonnées ───────────────────────────────────────────
    @Email
    @Column(unique = true, length = 150)
    private String email;

    @Column(name = "telephone", length = 30)
    private String telephone;

    @Column(name = "telephone_2", length = 30)
    private String telephone2;

    @Column(name = "fax", length = 30)
    private String fax;

    @Column(length = 300)
    private String adresse;

    @Column(length = 100)
    private String ville;

    @Column(length = 100)
    private String pays;

    @Column(name = "code_postal", length = 20)
    private String codePostal;

    @Column(length = 200)
    private String website;

    // ── Financier ────────────────────────────────────────────
    @Column(name = "iban", length = 50)
    private String iban;

    @Column(name = "commission_taux", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionTaux = new BigDecimal("10.00");

    @Column(name = "plafond_credit", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal plafondCredit = BigDecimal.ZERO;

    @Column(name = "credit_enabled", nullable = false)
    @Builder.Default
    private Boolean creditEnabled = false;

    @Column(name = "solde_actuel", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal soldeActuel = BigDecimal.ZERO;

    // ── Statut ───────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private AgenceStatus status = AgenceStatus.EN_ATTENTE;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = false;

    // ── Liens ────────────────────────────────────────────────
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "documents_url", columnDefinition = "TEXT")
    private String documentsUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // ── Timestamps ───────────────────────────────────────────
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    // ── Enum ─────────────────────────────────────────────────
    public enum AgenceStatus {
        EN_ATTENTE,
        APPROUVEE,
        REJETEE,
        SUSPENDUE,
        INACTIVE
    }

    // ── Méthodes utilitaires ─────────────────────────────────
    public boolean isApprouvee() {
        return this.status == AgenceStatus.APPROUVEE
                && Boolean.TRUE.equals(this.isActive);
    }

    public boolean hasCreditDisponible(BigDecimal montant) {
        if (this.plafondCredit == null || this.plafondCredit.compareTo(BigDecimal.ZERO) == 0) {
            return true;
        }
        BigDecimal utilise = this.soldeActuel != null ? this.soldeActuel : BigDecimal.ZERO;
        return utilise.add(montant).compareTo(this.plafondCredit) <= 0;
    }
}
