package com.luxtech.payment.repository;

import com.luxtech.payment.entity.Reversement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReversementRepository extends JpaRepository<Reversement, Long> {
    List<Reversement> findByHotelIdOrderByCreatedAtDesc(Long hotelId);
    List<Reversement> findAllByOrderByCreatedAtDesc();
}