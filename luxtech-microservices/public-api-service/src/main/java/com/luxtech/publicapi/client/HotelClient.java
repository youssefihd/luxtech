package com.luxtech.publicapi.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "hebergement-service")
public interface HotelClient {

    @GetMapping("/api/hebergement/hebergements/active")
    Map<String, Object> getActiveHotels();

    @GetMapping("/api/hebergement/hebergements/{id}")
    Map<String, Object> getHotelById(@PathVariable("id") Long id);

    @GetMapping("/api/hebergement/hebergements/slug/{slug}")
    Map<String, Object> getHotelBySlug(@PathVariable("slug") String slug);

    @GetMapping("/api/hebergement/hebergements/search")
    Map<String, Object> searchHotels(@RequestParam("q") String q);

    @GetMapping("/api/hebergement/hebergements/{hotelId}/chambre-types")
    Map<String, Object> getChambreTypes(@PathVariable("hotelId") Long hotelId);

    @GetMapping("/api/hebergement/hebergements/{hotelId}/chambres")
    Map<String, Object> getChambres(@PathVariable("hotelId") Long hotelId);

}
