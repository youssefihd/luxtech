package com.luxtech.hebergement.repository;

import com.luxtech.hebergement.entity.TarifSaisonnier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TarifSaisonnierRepository extends JpaRepository<TarifSaisonnier, Long> {
    List<TarifSaisonnier> findByHotelId(Long hotelId);
}