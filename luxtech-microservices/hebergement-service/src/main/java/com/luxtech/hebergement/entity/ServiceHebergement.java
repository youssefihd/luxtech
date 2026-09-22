package com.luxtech.hebergement.entity;

import jakarta.persistence.*;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "services") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceHebergement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @NotBlank @Column(nullable = false, length = 150) private String nom;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(nullable = false, length = 50) private String categorie;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal prix;
    private Integer duree;
    @Column(name = "capacite_max") private Integer capaciteMax;
    @Column(name = "image_url", columnDefinition = "TEXT") private String imageUrl;
    @Column(name = "is_active") @Builder.Default private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "hotel_id", nullable = false) private Hebergement hotel;

    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}