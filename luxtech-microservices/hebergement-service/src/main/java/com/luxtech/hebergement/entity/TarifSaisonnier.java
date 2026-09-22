package com.luxtech.hebergement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "tarifs_saisonniers") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TarifSaisonnier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @NotBlank @Column(nullable = false, length = 150) private String nom;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "hotel_id", nullable = false) private Hebergement hotel;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "chambre_type_id") private ChambreType chambreType;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "chambre_id") private Chambre chambre;

    @Column(name = "date_debut", nullable = false) private LocalDate dateDebut;
    @Column(name = "date_fin", nullable = false) private LocalDate dateFin;

    @Enumerated(EnumType.STRING) @Column(name = "type_ajustement", nullable = false, length = 20)
    private TypeAjustement typeAjustement;

    @Column(name = "valeur_ajustement", nullable = false, precision = 10, scale = 2)
    private BigDecimal valeurAjustement;

    @Builder.Default @Column(nullable = false) private Integer priorite = 0;
    @Builder.Default @Column(name = "is_active") private Boolean isActive = true;

    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;

    public enum TypeAjustement { FIXE, POURCENTAGE }
}