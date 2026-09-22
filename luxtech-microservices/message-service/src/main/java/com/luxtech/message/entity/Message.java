package com.luxtech.message.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Expediteur ────────────────────────────────────────────
    @Column(name = "expediteur_id")
    private Long expediteurId;

    @Column(name = "expediteur_nom", length = 100)
    private String expediteurNom;

    @Column(name = "expediteur_role", length = 50)
    private String expediteurRole;

    // ── Destinataire ──────────────────────────────────────────
    @Column(name = "destinataire_id")
    private Long destinataireId;

    @Column(name = "destinataire_nom", length = 100)
    private String destinataireNom;

    @Column(name = "destinataire_role", length = 50)
    private String destinataireRole;

    // ── Contenu ───────────────────────────────────────────────
    @NotBlank
    @Column(nullable = false, length = 200)
    private String sujet;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    // ── Statut ────────────────────────────────────────────────
    @Column(name = "is_lu")
    @Builder.Default
    private Boolean isLu = false;

    @Column(name = "date_lecture")
    private LocalDateTime dateLecture;

    @Column(name = "is_archive_expediteur")
    @Builder.Default
    private Boolean isArchiveExpediteur = false;

    @Column(name = "is_archive_destinataire")
    @Builder.Default
    private Boolean isArchiveDestinataire = false;

    @Column(name = "is_supprime_expediteur")
    @Builder.Default
    private Boolean isSupprimeExpediteur = false;

    @Column(name = "is_supprime_destinataire")
    @Builder.Default
    private Boolean isSupprimeDestinataire = false;

    // ── Conversation ──────────────────────────────────────────
    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "conversation_id", length = 50)
    private String conversationId;

    // ── Type ──────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private MessageType type = MessageType.MESSAGE;

    // ── Piece jointe ──────────────────────────────────────────
    @Column(name = "piece_jointe_url")
    private String pieceJointeUrl;

    @Column(name = "piece_jointe_nom", length = 200)
    private String pieceJointeNom;

    // ── Communication avec un client (sans compte utilisateur) ──
    // Colonne physique "hotel_id" conservee (deja migree), champ Java renomme "hebergementId"
    @Column(name = "hotel_id")
    private Long hebergementId;

    @Column(name = "reservation_id")
    private Long reservationId;

    @Column(name = "client_nom", length = 150)
    private String clientNom;

    @Column(name = "client_email", length = 150)
    private String clientEmail;

    @Column(name = "client_telephone", length = 30)
    private String clientTelephone;

    // ── Timestamps ───────────────────────────────────────────
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Enum ─────────────────────────────────────────────────
    public enum MessageType {
        MESSAGE,
        NOTIFICATION_SYSTEME,
        ALERTE,
        ANNONCE
    }

    // ── Methodes utilitaires ─────────────────────────────────
    public boolean isVisibleParExpediteur() {
        return !Boolean.TRUE.equals(this.isSupprimeExpediteur);
    }

    public boolean isVisibleParDestinataire() {
        return !Boolean.TRUE.equals(this.isSupprimeDestinataire);
    }
}