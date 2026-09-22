package com.luxtech.hebergement.repository;

import com.luxtech.hebergement.entity.ServiceHebergement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceHebergementRepository extends JpaRepository<ServiceHebergement, Long> {
    List<ServiceHebergement> findByHotelId(Long hotelId);
}