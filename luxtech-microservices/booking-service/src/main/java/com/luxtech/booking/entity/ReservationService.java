package com.luxtech.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity @Table(name = "reservations_services") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReservationService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @Column(name = "service_id", nullable = false) private Long serviceId;
    @Column(name = "service_nom", nullable = false, length = 150) private String serviceNom;
    @Column(name = "prix_unitaire", nullable = false, precision = 10, scale = 2) private BigDecimal prixUnitaire;

    @Column(name = "hotel_id", nullable = false) private Long hotelId;

    @Column(name = "reservation_id") private Long reservationId;

    @Column(name = "client_nom", length = 150) private String clientNom;
    @Column(name = "client_email", length = 150) private String clientEmail;
    @Column(name = "client_telephone", length = 30) private String clientTelephone;

    @Column(name = "service_date", nullable = false) private LocalDate serviceDate;
    @Column(name = "service_heure") private LocalTime serviceHeure;

    @Builder.Default @Column(nullable = false) private Integer quantite = 1;
    @Column(name = "prix_total", nullable = false, precision = 10, scale = 2) private BigDecimal prixTotal;
    @Builder.Default @Column(name = "montant_paye", precision = 10, scale = 2) private BigDecimal montantPaye = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    @Builder.Default private StatutReservationService statut = StatutReservationService.EN_ATTENTE;

    @Enumerated(EnumType.STRING) @Column(name = "statut_paiement", nullable = false, length = 20)
    @Builder.Default private StatutPaiementService statutPaiement = StatutPaiementService.NON_PAYE;

    @Enumerated(EnumType.STRING) @Column(name = "methode_paiement", length = 20)
    private MethodePaiementService methodePaiement;

    @Column(columnDefinition = "TEXT") private String notes;

    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;

    public enum StatutReservationService { EN_ATTENTE, CONFIRMEE, TERMINEE, ANNULEE }
    public enum StatutPaiementService { NON_PAYE, PARTIELLEMENT_PAYE, PAYE, FACTURE_CHAMBRE }
    public enum MethodePaiementService { ESPECE, CARTE, VIREMENT }
}