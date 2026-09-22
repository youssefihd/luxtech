package com.luxtech.hebergement.repository;

import com.luxtech.hebergement.entity.ChambreType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChambreTypeRepository extends JpaRepository<ChambreType, Long> {

    List<ChambreType> findByHotelId(Long hotelId);

    @Query("SELECT ct FROM ChambreType ct WHERE ct.hotel.id = :hotelId")
    List<ChambreType> findAllByHotelId(@Param("hotelId") Long hotelId);

    boolean existsByNomAndHotelId(String nom, Long hotelId);
}