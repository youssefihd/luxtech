package com.luxtech.publicapi.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "hotel-service")
public interface HotelClient {

    @GetMapping("/api/hotel/hotels/active")
    Map<String, Object> getActiveHotels();

    @GetMapping("/api/hotel/hotels/{id}")
    Map<String, Object> getHotelById(@PathVariable("id") Long id);

    @GetMapping("/api/hotel/hotels/slug/{slug}")
    Map<String, Object> getHotelBySlug(@PathVariable("slug") String slug);

    @GetMapping("/api/hotel/hotels/search")
    Map<String, Object> searchHotels(@RequestParam("q") String q);

    @GetMapping("/api/hotel/hotels/{hotelId}/chambre-types")
    Map<String, Object> getChambreTypes(@PathVariable("hotelId") Long hotelId);

    @GetMapping("/api/hotel/hotels/{hotelId}/chambres")
    Map<String, Object> getChambres(@PathVariable("hotelId") Long hotelId);

    @GetMapping("/api/hotel/chambres/{numero}")
    Map<String, Object> getByNumero(@PathVariable("numero") String numero);
}