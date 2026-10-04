package com.luxtech.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Numéro unique ─────────────────────────────────────────
    @Column(name = "numero_reservation", unique = true, nullable = false, length = 30)
    private String numeroReservation;

    // ── Liens vers autres services ────────────────────────────
    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;

    @Column(name = "chambre_id")
    private Long chambreId;

    @Column(name = "chambre_type_id")
    private Long chambreTypeId;

    @Column(name = "client_id")
    private Long clientId;

    @Column(name = "agency_id")
    private Long agencyId;

    @Column(name = "user_id")
    private Long userId;

    // ── Données client dénormalisées ──────────────────────────
    @Column(name = "client_nom", length = 100)
    private String clientNom;

    @Column(name = "client_prenom", length = 100)
    private String clientPrenom;

    @Column(name = "client_email", length = 150)
    private String clientEmail;

    @Column(name = "client_telephone", length = 30)
    private String clientTelephone;

    @Column(name = "client_nationalite", length = 50)
    private String clientNationalite;

    @Column(name = "client_cin_passeport", length = 50)
    private String clientCinPasseport;

    // ── Dates ─────────────────────────────────────────────────
    @Column(name = "date_arrivee", nullable = false)
    private LocalDate dateArrivee;

    @Column(name = "date_depart", nullable = false)
    private LocalDate dateDepart;

    @Column(name = "nb_adultes")
    @Builder.Default
    private Integer nbAdultes = 1;

    @Column(name = "nb_enfants")
    @Builder.Default
    private Integer nbEnfants = 0;

    @Column(name = "nb_nuits")
    private Integer nbNuits;

    // ── Financier ─────────────────────────────────────────────
    @Column(name = "prix_chambre_nuit", precision = 10, scale = 2)
    private BigDecimal prixChambreNuit;

    @Column(name = "prix_total", precision = 12, scale = 2)
    private BigDecimal prixTotal;

    @Column(name = "prix_ht", precision = 12, scale = 2)
    private BigDecimal prixHt;

    @Column(name = "montant_tva", precision = 12, scale = 2)
    private BigDecimal montantTva;

    @Column(name = "taux_tva", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal tauxTva = new BigDecimal("20.00");

    @Column(name = "montant_commission", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal montantCommission = BigDecimal.ZERO;

    @Column(name = "taux_commission", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal tauxCommission = new BigDecimal("10.00");

    @Column(name = "taux_marge_agence", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal tauxMargeAgence = BigDecimal.ZERO;

    @Column(name = "montant_marge_agence", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal montantMargeAgence = BigDecimal.ZERO;

    @Column(name = "montant_reverse", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal montantReverse = BigDecimal.ZERO;

    @Column(name = "montant_paye", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal montantPaye = BigDecimal.ZERO;

    // ── Statuts ───────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.EN_ATTENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 30)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.NON_PAYE;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 30)
    @Builder.Default
    private ReservationSource source = ReservationSource.DIRECT;

    // ── Stripe ────────────────────────────────────────────────
    @Column(name = "stripe_payment_intent_id", length = 100)
    private String stripePaymentIntentId;

    // ── Annulation ────────────────────────────────────────────
    @Column(name = "date_annulation")
    private LocalDateTime dateAnnulation;

    @Column(name = "motif_annulation", columnDefinition = "TEXT")
    private String motifAnnulation;

    @Column(name = "annule_par", length = 50)
    private String annulePar;

    @Enumerated(EnumType.STRING)
    @Column(name = "annulation_demande_statut", length = 20)
    @Builder.Default
    private CancellationRequestStatus annulationDemandeStatut = CancellationRequestStatus.AUCUNE;

    @Column(name = "annulation_demande_motif", columnDefinition = "TEXT")
    private String annulationDemandeMotif;

    @Column(name = "annulation_demande_at")
    private LocalDateTime annulationDemandeAt;

    @Column(name = "annulation_demande_par")
    private Long annulationDemandePar;

    @Column(name = "annulation_refus_motif", columnDefinition = "TEXT")
    private String annulationRefusMotif;

    @Column(name = "montant_remboursement", precision = 12, scale = 2)
    private BigDecimal montantRemboursement;

    // ── Check-in / Check-out réels ────────────────────────────
    @Column(name = "date_checkin_reel")
    private LocalDateTime dateCheckinReel;

    @Column(name = "date_checkout_reel")
    private LocalDateTime dateCheckoutReel;

    // ── Informations complémentaires ──────────────────────────
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "demandes_speciales", columnDefinition = "TEXT")
    private String demandesSpeciales;

    @Column(name = "numero_facture", length = 30)
    private String numeroFacture;

    @Column(name = "canal_distribution", length = 50)
    private String canalDistribution;

    // ── Timestamps ───────────────────────────────────────────
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Enums ────────────────────────────────────────────────
    public enum ReservationStatus {
        EN_ATTENTE,
        CONFIRMEE,
        CHECKIN,
        CHECKOUT,
        ANNULEE,
        NO_SHOW
    }

    public enum PaymentStatus {
        NON_PAYE,
        PARTIELLEMENT_PAYE,
        PAYE,
        REMBOURSE,
        ANNULE
    }

    public enum CancellationRequestStatus {
        AUCUNE,
        DEMANDEE,
        REFUSEE,
        ACCEPTEE
    }

    public enum ReservationSource {
        DIRECT,
        AGENCE,
        BOOKING_ENGINE,
        PMS,
        CHANNEL_MANAGER
    }

    // ── Méthodes utilitaires simples ─────────────────────────
    public boolean isAnnulable() {
        return this.status == ReservationStatus.EN_ATTENTE
                || this.status == ReservationStatus.CONFIRMEE;
    }

    public boolean isPaye() {
        return this.paymentStatus == PaymentStatus.PAYE;
    }

    public BigDecimal getMontantRestant() {
        if (this.prixTotal == null) return BigDecimal.ZERO;
        BigDecimal paye = this.montantPaye != null
                ? this.montantPaye
                : BigDecimal.ZERO;
        return this.prixTotal.subtract(paye);
    }

    public void calculerMontants(BigDecimal prixNuit, BigDecimal tauxCommissionAgence) {
        if (prixNuit == null || this.nbNuits == null) return;

        this.prixChambreNuit = prixNuit;
        this.prixTotal       = prixNuit.multiply(BigDecimal.valueOf(this.nbNuits));

        // TVA 20%
        this.tauxTva    = new BigDecimal("20.00");
        this.prixHt     = this.prixTotal.divide(
                new BigDecimal("1.20"), 2, RoundingMode.HALF_UP);
        this.montantTva = this.prixTotal.subtract(this.prixHt);

        // Commission
        if (tauxCommissionAgence != null) {
            this.tauxCommission    = tauxCommissionAgence;
            this.montantCommission = this.prixTotal
                    .multiply(tauxCommissionAgence)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        }

        // Montant à reverser à l'hôtel
        this.montantReverse = this.prixTotal.subtract(this.montantCommission);
    }
}
