package com.luxtech.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "hebergement-service")
public interface HebergementClient {

    @GetMapping("/api/hebergement/hebergements/{id}")
    HebergementApiResponse getById(@PathVariable("id") Long id);

    @PatchMapping("/api/hebergement/chambres/{id}/status")
    void updateChambreStatus(@PathVariable("id") Long id, @RequestParam("status") String status);

    @GetMapping("/api/hebergement/services/{id}")
    ServiceApiResponse getServiceById(@PathVariable("id") Long id);

    @GetMapping("/api/hebergement/hebergements/{hotelId}/chambres")
    ChambreApiResponse getChambresByHotel(@PathVariable("hotelId") Long hotelId);

    @PostMapping("/api/hebergement/hebergements/{hotelId}/activity-logs")
    void logActivite(@PathVariable("hotelId") Long hotelId, @RequestBody ActivityLogDto dto);

}