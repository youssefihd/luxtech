package com.luxtech.booking.repository;

import com.luxtech.booking.entity.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Long> {
    List<Facture> findByReservationId(Long reservationId);
    List<Facture> findByReservationServiceId(Long reservationServiceId);
    List<Facture> findByHotelId(Long hotelId);
    List<Facture> findByAgenceId(Long agenceId);
    Optional<Facture> findByNumeroFacture(String numero);
    List<Facture> findByStatut(Facture.StatutFacture statut);
}
