package com.luxtech.hebergement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hotels")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hebergement {

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Photo> photos = new ArrayList<>();

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String nom;

    @Column(name = "nom_legal", length = 200)
    private String nomLegal;

    @Column(name = "numero_fiscal", length = 50)
    private String numeroFiscal;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    private String adresse;

    @NotBlank
    @Column(length = 100)
    private String ville;

    @NotBlank
    @Column(length = 100)
    private String pays;

    @Column(name = "code_postal", length = 20)
    private String codePostal;

    @Column(name = "telephone", length = 30)
    private String telephone;

    @Column(length = 150)
    private String email;

    @Column(length = 200)
    private String website;

    private Integer etoiles;

    @Column(length = 100)
    private String slug;

    @Column(name = "booking_engine_actif")
    @Builder.Default
    private Boolean bookingEngineActif = true;

    @Column(name = "booking_page_config", columnDefinition = "TEXT")
    private String bookingPageConfig;

    @Column(name = "booking_engine_description", columnDefinition = "TEXT")
    private String bookingEngineDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private HebergementStatus status = HebergementStatus.PENDING_APPROVAL;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    private Double latitude;
    private Double longitude;

    @Column(name = "heure_checkin", length = 10)
    @Builder.Default
    private String heureCheckin = "15:00";

    @Column(name = "heure_checkout", length = 10)
    @Builder.Default
    private String heureCheckout = "11:00";

    @Column(length = 3)
    @Builder.Default
    private String devise = "MAD";

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "commission_taux", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal commissionTaux = new BigDecimal("10.00");

    @Column(name = "documents_legaux")
    private String documentsLegaux;

    @Column(name = "iban", length = 50)
    private String iban;

    @Column(name = "delai_reversement_jours")
    @Builder.Default
    private Integer delaiReversementJours = 14;

    @Column(name = "rc", length = 50)
    private String rc;

    @Column(name = "patente", length = 50)
    private String patente;

    @Column(name = "cnss", length = 50)
    private String cnss;

    @Column(name = "ice", length = 50)
    private String ice;

    @Column(columnDefinition = "TEXT")
    private String equipements;

    @Column(name = "services_inclus", columnDefinition = "TEXT")
    private String servicesInclus;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChambreType> chambreTypes = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum HebergementStatus {
        PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED, INACTIVE
    }
}