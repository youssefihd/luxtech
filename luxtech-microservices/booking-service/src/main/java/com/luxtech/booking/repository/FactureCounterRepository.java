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

    // PostgreSQL upsert: create the counter once; concurrent requests safely become no-ops.
    @Modifying
    @Query(value = "INSERT INTO facture_counters (hotel_id, dernier_numero) VALUES (:hotelId, 0) ON CONFLICT (hotel_id) DO NOTHING", nativeQuery = true)
    void ensureExistsPostgres(@Param("hotelId") Long hotelId);

    // MySQL equivalent used by the Docker Compose environment.
    @Modifying
    @Query(value = "INSERT IGNORE INTO facture_counters (hotel_id, dernier_numero) VALUES (:hotelId, 0)", nativeQuery = true)
    void ensureExistsMysql(@Param("hotelId") Long hotelId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM FactureCounter c WHERE c.hotelId = :hotelId")
    Optional<FactureCounter> findByHotelIdForUpdate(@Param("hotelId") Long hotelId);
}
