package com.luxtech.payment.repository;

import com.luxtech.payment.entity.Abonnement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {
    List<Abonnement> findByHotelIdOrderByCreatedAtDesc(Long hotelId);
    Optional<Abonnement> findFirstByHotelIdAndStatutAndDateExpirationGreaterThanEqual(
            Long hotelId, Abonnement.Statut statut, LocalDate date);
    List<Abonnement> findByHotelIdAndStatut(Long hotelId, Abonnement.Statut statut);
    List<Abonnement> findByStatutAndDateExpirationGreaterThanEqual(Abonnement.Statut statut, LocalDate date);
}