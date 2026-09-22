package com.luxtech.hebergement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity @Table(name = "activity_logs") @EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @Column(name = "hotel_id", nullable = false) private Long hotelId;
    @Column(name = "user_id") private Long userId;
    @Column(name = "user_nom", length = 150) private String userNom;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Action action;
    @Column(nullable = false, length = 50) private String entite;

    @Column(nullable = false, columnDefinition = "TEXT") private String description;
    @Column(columnDefinition = "TEXT") private String details;

    @CreatedDate @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;

    public enum Action { CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW, EXPORT, IMPORT }
}