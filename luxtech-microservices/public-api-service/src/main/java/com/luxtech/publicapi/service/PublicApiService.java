package com.luxtech.publicapi.service;

import com.luxtech.publicapi.client.BookingClient;
import com.luxtech.publicapi.client.HotelClient;
import com.luxtech.publicapi.dto.PublicDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublicApiService {

    private final HotelClient   hotelClient;
    private final BookingClient bookingClient;

    // ── Recherche hotels ──────────────────────────────────────
    public Map<String, Object> searchHotels(PublicDto.SearchRequest req) {
        try {
            if (req.getVille() != null && !req.getVille().isBlank()) {
                return hotelClient.searchHotels(req.getVille());
            }
            return hotelClient.getActiveHotels();
        } catch (Exception e) {
            log.error("Erreur recherche hotels : {}", e.getMessage());
            return Map.of("success", false, "message", "Service hébergement indisponible.", "data", List.of());
        }
    }

    // ── Detail hotel par ID ───────────────────────────────────
    public Map<String, Object> getHotel(Long id) {
        try {
            return hotelClient.getHotelById(id);
        } catch (Exception e) {
            log.error("Erreur getHotel : {}", e.getMessage());
            return Map.of("success", false, "message", "Hotel introuvable");
        }
    }

    // ── Detail hotel par slug ─────────────────────────────────
    public Map<String, Object> getHotelBySlug(String slug) {
        try {
            return hotelClient.getHotelBySlug(slug);
        } catch (Exception e) {
            log.error("Erreur getHotelBySlug : {}", e.getMessage());
            return Map.of("success", false, "message", "Hotel introuvable");
        }
    }

    // ── Types de chambres ─────────────────────────────────────
    public Map<String, Object> getChambreTypes(Long hotelId) {
        try {
            return hotelClient.getChambreTypes(hotelId);
        } catch (Exception e) {
            log.error("Erreur getChambreTypes : {}", e.getMessage());
            return Map.of("success", false, "data", List.of());
        }
    }

    // ── Creer une reservation ─────────────────────────────────
    public Map<String, Object> createBooking(PublicDto.BookingRequest req) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("hotelId",         req.getHotelId());
            body.put("chambreTypeId",   req.getChambreTypeId());
            body.put("chambreId",       req.getChambreId());
            body.put("clientNom",       req.getClientNom());
            body.put("clientPrenom",    req.getClientPrenom());
            body.put("clientEmail",     req.getClientEmail());
            body.put("clientTelephone", req.getClientTelephone());
            body.put("dateArrivee",     req.getDateArrivee() != null
                    ? req.getDateArrivee().toString() : null);
            body.put("dateDepart",      req.getDateDepart() != null
                    ? req.getDateDepart().toString() : null);
            body.put("nbAdultes",       req.getNbAdultes());
            body.put("nbEnfants",       req.getNbEnfants());
            body.put("notes",           req.getNotes());
            body.put("source",          "DIRECT");
            return bookingClient.createReservation(body);
        } catch (Exception e) {
            log.error("Erreur createBooking : {}", e.getMessage());
            return Map.of("success", false,
                    "message", "Erreur reservation : " + e.getMessage());
        }
    }
}
