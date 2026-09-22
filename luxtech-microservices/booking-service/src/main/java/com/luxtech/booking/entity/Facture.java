package com.luxtech.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "factures")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_facture", unique = true, nullable = false, length = 30)
    private String numeroFacture;

    @Column(name = "reservation_id")
    private Long reservationId;

    @Column(name = "reservation_service_id")
    private Long reservationServiceId;

    @Column(name = "agence_id")
    private Long agenceId;

    @Column(name = "hotel_id")
    private Long hotelId;

    @Column(name = "montant_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal montantTotal;

    @Column(name = "montant_ht", precision = 12, scale = 2)
    private BigDecimal montantHt;

    @Column(name = "montant_tva", precision = 12, scale = 2)
    private BigDecimal montantTva;

    @Column(name = "taux_tva", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal tauxTva = new BigDecimal("10.00");

    @Column(name = "montant_commission", precision = 12, scale = 2)
    private BigDecimal montantCommission;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_facture", nullable = false, length = 20)
    private TypeFacture typeFacture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private StatutFacture statut = StatutFacture.IMPAYEE;

    @Enumerated(EnumType.STRING)
    @Column(name = "methode_paiement", length = 20)
    private MethodePaiement methodePaiement;

    @Column(name = "date_facture", nullable = false)
    private LocalDate dateFacture;

    @Column(name = "date_echeance")
    private LocalDate dateEcheance;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum TypeFacture  { AGENCE, HOTEL, SAAS }

    public enum StatutFacture {
        PAYEE,
        PARTIELLEMENT_PAYEE,
        IMPAYEE,
        ANNULEE
    }

    public enum MethodePaiement {
        ESPECE,
        CARTE,
        CHEQUE,
        VIREMENT
    }
}