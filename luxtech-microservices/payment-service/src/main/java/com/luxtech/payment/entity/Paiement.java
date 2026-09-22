package com.luxtech.payment.entity;
import jakarta.persistence.*;
import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "paiements") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Paiement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "reservation_id") private Long reservationId;
    @Column(name = "reservation_service_id") private Long reservationServiceId;
    @Column(name = "abonnement_id") private Long abonnementId;
    @Column(name = "hotel_id")  private Long hotelId;
    @Column(name = "client_id") private Long clientId;
    @Column(name = "client_nom", length = 150) private String clientNom;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal montant;
    @Enumerated(EnumType.STRING) @Column(name = "mode_paiement", nullable = false, length = 30) private ModePaiement modePaiement;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) @Builder.Default private PaiementStatus status = PaiementStatus.EN_ATTENTE;
    @Column(name = "stripe_payment_intent_id", length = 100) private String stripePaymentIntentId;
    @Column(name = "stripe_charge_id", length = 100) private String stripeChargeId;
    @Column(length = 100) private String reference;
    @Column(columnDefinition = "TEXT") private String notes;
    @Column(name = "date_paiement") private LocalDateTime datePaiement;
    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at") private LocalDateTime updatedAt;

    public enum ModePaiement  { CARTE_BANCAIRE, ESPECES, VIREMENT, CHEQUE, STRIPE }
    public enum PaiementStatus { EN_ATTENTE, VALIDE, ECHOUE, REMBOURSE, ANNULE }
}