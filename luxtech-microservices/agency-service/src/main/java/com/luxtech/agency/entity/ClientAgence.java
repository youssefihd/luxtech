package com.luxtech.agency.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "agence_clients", indexes = @Index(name = "idx_agence_clients_agence", columnList = "agence_id"))
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClientAgence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "agence_id", nullable = false)
    private Long agenceId;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    @Column(length = 150)
    private String email;

    @Column(length = 30)
    private String telephone;

    @Column(length = 80)
    private String nationalite;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(length = 300)
    private String adresse;

    @Column(columnDefinition = "TEXT")
    private String preferences;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
