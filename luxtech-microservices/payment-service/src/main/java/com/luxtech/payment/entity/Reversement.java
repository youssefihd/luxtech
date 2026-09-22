package com.luxtech.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reversements")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reversement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;

    @Column(name = "montant_brut", nullable = false, precision = 12, scale = 2)
    private BigDecimal montantBrut;

    @Column(name = "montant_commission", nullable = false, precision = 12, scale = 2)
    private BigDecimal montantCommission;

    @Column(name = "montant_net", nullable = false, precision = 12, scale = 2)
    private BigDecimal montantNet;

    @Column(name = "periode_debut", nullable = false)
    private LocalDate periodeDebut;

    @Column(name = "periode_fin", nullable = false)
    private LocalDate periodeFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutReversement statut = StatutReversement.EN_ATTENTE;

    @Column(name = "date_reversement")
    private LocalDateTime dateReversement;

    @Column(name = "reference_virement", length = 100)
    private String referenceVirement;

    @Column(name = "nb_reservations")
    private Integer nbReservations;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum StatutReversement { EN_ATTENTE, EFFECTUE, ECHEC }
}