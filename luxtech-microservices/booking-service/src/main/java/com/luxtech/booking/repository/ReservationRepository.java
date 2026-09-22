package com.luxtech.booking.repository;

import com.luxtech.booking.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Optional<Reservation> findByNumeroReservation(String numero);
    List<Reservation> findByHotelId(Long hotelId);
    List<Reservation> findByClientId(Long clientId);
    List<Reservation> findByUserId(Long userId);
    List<Reservation> findByAgencyId(Long agencyId);
    List<Reservation> findByHotelIdAndStatus(Long hotelId, Reservation.ReservationStatus status);
    List<Reservation> findByStatusAndDateDepartLessThanEqual(Reservation.ReservationStatus status, LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE r.chambreId = :chambreId AND r.status NOT IN ('ANNULEE','CHECKOUT') " +
            "AND NOT (r.dateDepart <= :arrivee OR r.dateArrivee >= :depart)")
    List<Reservation> findConflicts(@Param("chambreId") Long chambreId,
                                    @Param("arrivee") LocalDate arrivee,
                                    @Param("depart") LocalDate depart);

    @Query("SELECT r FROM Reservation r WHERE r.hotelId = :hotelId AND r.dateArrivee = :date AND r.status = 'CONFIRMEE'")
    List<Reservation> findCheckinsDuJour(@Param("hotelId") Long hotelId, @Param("date") LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE r.hotelId = :hotelId AND ( " +
            "(r.status = 'CHECKIN' AND r.dateDepart = :date) OR " +
            "(r.status = 'CHECKOUT' AND FUNCTION('DATE', r.dateCheckoutReel) = :date) )")
    List<Reservation> findCheckoutsDuJour(@Param("hotelId") Long hotelId, @Param("date") LocalDate date);
}