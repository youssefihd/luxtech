package com.luxtech.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

@Entity @Table(name = "parametres")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Parametre {
    @Id
    @Column(name = "cle", length = 100)
    private String cle;

    @Column(name = "valeur", columnDefinition = "TEXT")
    private String valeur;

    @Column(name = "categorie", length = 50)
    private String categorie;

    @Column(name = "description", length = 255)
    private String description;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}