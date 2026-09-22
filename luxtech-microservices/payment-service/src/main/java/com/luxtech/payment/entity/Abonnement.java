package com.luxtech.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "abonnements") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Abonnement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @Column(name = "hotel_id", nullable = false) private Long hotelId;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Plan plan;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal prix;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    @Builder.Default private Statut statut = Statut.EN_ATTENTE;

    @Column(name = "date_debut") private LocalDate dateDebut;
    @Column(name = "date_expiration") private LocalDate dateExpiration;

    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;

    public enum Plan { BASIQUE, PREMIUM, ENTREPRISE }
    public enum Statut { EN_ATTENTE, ACTIF, ANNULE, EXPIRE }
}