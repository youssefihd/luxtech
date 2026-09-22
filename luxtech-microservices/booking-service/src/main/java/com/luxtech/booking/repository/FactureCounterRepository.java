package com.luxtech.booking.repository;

import com.luxtech.booking.entity.FactureCounter;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FactureCounterRepository extends JpaRepository<FactureCounter, Long> {

    // Crée la ligne du compteur si elle n'existe pas encore pour cet hôtel (no-op sinon).
    // Évite la course entre deux premières factures simultanées pour un même hôtel.
    @Modifying
    @Query(value = "INSERT IGNORE INTO facture_counters (hotel_id, dernier_numero) VALUES (:hotelId, 0)", nativeQuery = true)
    void ensureExists(@Param("hotelId") Long hotelId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM FactureCounter c WHERE c.hotelId = :hotelId")
    Optional<FactureCounter> findByHotelIdForUpdate(@Param("hotelId") Long hotelId);
}