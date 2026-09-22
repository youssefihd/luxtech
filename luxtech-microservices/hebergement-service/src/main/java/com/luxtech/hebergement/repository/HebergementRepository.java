package com.luxtech.hebergement.repository;

import com.luxtech.hebergement.entity.Hebergement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HebergementRepository extends JpaRepository<Hebergement, Long> {

    List<Hebergement> findByUserId(Long userId);

    List<Hebergement> findByStatus(Hebergement.HebergementStatus status);

    Optional<Hebergement> findBySlug(String slug);

    @Query("SELECT h FROM Hebergement h WHERE h.status = 'APPROVED' AND h.isActive = true")
    List<Hebergement> findAllActive();

    @Query("SELECT h FROM Hebergement h WHERE h.status = 'APPROVED' " +
            "AND h.isActive = true " +
            "AND LOWER(h.ville) LIKE LOWER(CONCAT('%',:ville,'%'))")
    List<Hebergement> findActiveByVille(@Param("ville") String ville);

    @Query("SELECT h FROM Hebergement h WHERE h.status = 'APPROVED' " +
            "AND h.isActive = true " +
            "AND (LOWER(h.nom) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR LOWER(h.ville) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR LOWER(h.pays) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Hebergement> search(@Param("q") String q);

    boolean existsByEmail(String email);

    boolean existsBySlug(String slug);
}