package com.luxtech.booking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "facture_counters", uniqueConstraints = @UniqueConstraint(columnNames = "hotel_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FactureCounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hotel_id", nullable = false, unique = true)
    private Long hotelId;

    @Column(name = "dernier_numero", nullable = false)
    @Builder.Default
    private Long dernierNumero = 0L;
}