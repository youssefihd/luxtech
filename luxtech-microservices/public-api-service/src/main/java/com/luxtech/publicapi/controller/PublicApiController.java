package com.luxtech.publicapi.controller;

import com.luxtech.publicapi.dto.PublicDto;
import com.luxtech.publicapi.service.PublicApiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class PublicApiController {

    private final PublicApiService publicApiService;

    // ── Recherche hotels ──────────────────────────────────────
    @GetMapping("/api/public/hotels")
    public ResponseEntity<Map<String, Object>> getHotels(
            @RequestParam(required = false) String ville,
            @RequestParam(required = false, defaultValue = "1") Integer nbAdultes) {
        PublicDto.SearchRequest req = PublicDto.SearchRequest.builder()
                .ville(ville).nbAdultes(nbAdultes).build();
        return ResponseEntity.ok(publicApiService.searchHotels(req));
    }

    // ── Search compatible frontend ────────────────────────────
    @GetMapping("/api/search/hotels")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) Integer nbAdultes) {
        PublicDto.SearchRequest req = PublicDto.SearchRequest.builder()
                .ville(ville).nbAdultes(nbAdultes).build();
        return ResponseEntity.ok(publicApiService.searchHotels(req));
    }

    // ── Detail hotel par ID ───────────────────────────────────
    @GetMapping("/api/public/hotels/{id}")
    public ResponseEntity<Map<String, Object>> getHotel(
            @PathVariable Long id) {
        return ResponseEntity.ok(publicApiService.getHotel(id));
    }

    // ── Detail hotel par slug ─────────────────────────────────
    @GetMapping("/api/public/hotels/slug/{slug}")
    public ResponseEntity<Map<String, Object>> getHotelBySlug(
            @PathVariable String slug) {
        return ResponseEntity.ok(publicApiService.getHotelBySlug(slug));
    }

    // ── Chambres d'un hotel ───────────────────────────────────
    @GetMapping("/api/public/hotels/{hotelId}/chambres")
    public ResponseEntity<Map<String, Object>> getChambres(
            @PathVariable Long hotelId) {
        return ResponseEntity.ok(publicApiService.getChambreTypes(hotelId));
    }

    // ── Creer une reservation ─────────────────────────────────
    @PostMapping("/api/public/booking")
    public ResponseEntity<Map<String, Object>> book(
            @Valid @RequestBody PublicDto.BookingRequest req) {
        return ResponseEntity.status(201)
                .body(publicApiService.createBooking(req));
    }

    // ── Health ────────────────────────────────────────────────
    @GetMapping("/api/public/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("public-api-service UP");
    }
}