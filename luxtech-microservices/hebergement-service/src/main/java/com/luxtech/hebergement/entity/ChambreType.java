package com.luxtech.hebergement.entity;
import jakarta.persistence.*;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name = "chambre_types") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChambreType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @NotBlank @Column(nullable = false, length = 150) private String nom;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "prix_base", precision = 10, scale = 2) private BigDecimal prixBase;
    @Column(name = "capacite_adultes") @Builder.Default private Integer capaciteAdultes = 2;
    @Column(name = "capacite_enfants") @Builder.Default private Integer capaciteEnfants = 0;
    @Column(columnDefinition = "TEXT") private String amenities;
    @Column(name = "images_urls", columnDefinition = "TEXT") private String imagesUrls;
    @Column(name = "ordre_affichage") @Builder.Default private Integer ordreAffichage = 0;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "hotel_id", nullable = false) private Hebergement hotel;
    @OneToMany(mappedBy = "chambreType", cascade = CascadeType.ALL) @Builder.Default private List<Chambre> chambres = new ArrayList<>();
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;
}