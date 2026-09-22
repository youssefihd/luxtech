package com.luxtech.publicapi.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "booking-service")
public interface BookingClient {

    @PostMapping("/api/booking/reservations/create")
    Map<String, Object> createReservation(@RequestBody Map<String, Object> request);
}