package com.luxtech.hebergement.repository;

import com.luxtech.hebergement.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByHotelIdOrderByCreatedAtDesc(Long hotelId);
}