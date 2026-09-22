package com.luxtech.hebergement.entity;
import jakarta.persistence.*;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "chambres") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Chambre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @NotBlank @Column(name = "numero", nullable = false, length = 20) private String numero;
    private Integer etage;
    @Column(name = "capacite") private Integer capacite;
    @Column(name = "prix_nuitee", precision = 10, scale = 2) private BigDecimal prixNuitee;
    @Column(name = "superficie", precision = 6, scale = 2) private BigDecimal superficie;
    @Column(name = "image_url", columnDefinition = "TEXT") private String imageUrl;
    @Column(columnDefinition = "TEXT") private String equipements;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) @Builder.Default private ChambreStatus status = ChambreStatus.DISPONIBLE;
    @Column(name = "status_changed_at") private LocalDateTime statusChangedAt;
    @Column(name = "status_duree_minutes") private Integer statusDureeMinutes;
    @Column(name = "is_active") @Builder.Default private Boolean isActive = true;
    @Column(columnDefinition = "TEXT") private String notes;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "chambre_type_id", nullable = false) private ChambreType chambreType;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
    public enum ChambreStatus { DISPONIBLE, RESERVEE, OCCUPEE, EN_NETTOYAGE, EN_MAINTENANCE, HORS_SERVICE }
}