package com.luxtech.booking.repository;

import com.luxtech.booking.entity.ReservationService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationServiceRepository extends JpaRepository<ReservationService, Long> {
    List<ReservationService> findByHotelId(Long hotelId);
    List<ReservationService> findByReservationId(Long reservationId);
}