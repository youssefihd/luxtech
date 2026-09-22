package com.luxtech.hebergement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity
@Table(name = "channel_managers")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChannelManager {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(name = "api_key", length = 200)
    private String apiKey;

    @Column(name = "url_api", length = 300)
    private String urlApi;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StatutChannel statut = StatutChannel.INACTIF;

    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;

    @Column(name = "derniere_sync")
    private LocalDateTime derniereSynchronisation;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum StatutChannel { ACTIF, INACTIF, ERREUR }
}