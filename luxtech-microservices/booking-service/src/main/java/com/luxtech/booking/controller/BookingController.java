package com.luxtech.booking.controller;
import com.luxtech.booking.dto.BookingDto;
import com.luxtech.booking.client.HebergementApiResponse;
import com.luxtech.booking.client.HebergementClient;
import com.luxtech.booking.entity.Facture;
import com.luxtech.booking.entity.Reservation;
import com.luxtech.booking.entity.ReservationService;
import com.luxtech.booking.service.BookingService;
import com.luxtech.booking.exception.BookingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    private final HebergementClient hebergementClient;

    @GetMapping("/agency/reservations")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.ReservationResponse>>> getAgencyReservations(
            @RequestHeader("X-Agency-Id") String agencyId,
            @RequestHeader("X-User-Role") String role) {
        Long authenticatedAgencyId = authorizeAgency(agencyId, role);
        List<BookingDto.ReservationResponse> list = bookingService.getByAgency(authenticatedAgencyId)
                .stream().map(bookingService::toResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/agency/factures")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.FactureResponse>>> getAgencyFactures(
            @RequestHeader("X-Agency-Id") String agencyId,
            @RequestHeader("X-User-Role") String role) {
        Long authenticatedAgencyId = authorizeAgency(agencyId, role);
        List<BookingDto.FactureResponse> list = bookingService.getFacturesByAgency(authenticatedAgencyId)
                .stream().map(bookingService::toFactureResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/agency/factures/{factureId}/pdf")
    public ResponseEntity<byte[]> downloadAgencyFacture(
            @PathVariable Long factureId,
            @RequestHeader("X-Agency-Id") String agencyId,
            @RequestHeader("X-User-Role") String role) {
        Long authenticatedAgencyId = authorizeAgency(agencyId, role);
        Facture facture = bookingService.getFactureById(factureId);
        if (!authenticatedAgencyId.equals(facture.getAgenceId())) {
            throw new BookingException("Acces facture refuse.", 403);
        }
        byte[] pdf = bookingService.genererFacturePdf(facture);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + facture.getNumeroFacture() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/agency/factures/{factureId}/paiement")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.FactureResponse>> payAgencyFacture(
            @PathVariable Long factureId,
            @RequestHeader("X-Agency-Id") String agencyId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody BookingDto.PaiementFactureRequest request) {
        Long authenticatedAgencyId = authorizeAgency(agencyId, role);
        Facture facture = bookingService.getFactureById(factureId);
        if (!authenticatedAgencyId.equals(facture.getAgenceId())) {
            throw new BookingException("Acces facture refuse.", 403);
        }
        Facture updated = bookingService.enregistrerPaiementFacture(factureId, request.getMethode());
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Paiement enregistre.", bookingService.toFactureResponse(updated)));
    }

    @PostMapping("/agency/reservations")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> createAgencyReservation(
            @Valid @RequestBody BookingDto.PublicReservationRequest req,
            @RequestHeader("X-Agency-Id") String agencyId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role) {
        Long authenticatedAgencyId = authorizeAgency(agencyId, role);
        Reservation reservation = bookingService.creerReservationAgence(req, authenticatedAgencyId, Long.parseLong(userId));
        return ResponseEntity.status(201).body(BookingDto.ApiResponse.ok(
                "Demande de réservation agence créée.", bookingService.toResponse(reservation)));
    }

    @PostMapping("/agency/reservations/{reservationId}/demande-annulation")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> requestAgencyCancellation(
            @PathVariable Long reservationId,
            @RequestHeader("X-Agency-Id") String agencyId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody(required = false) BookingDto.CancellationRequest request) {
        Long authenticatedAgencyId = authorizeAgency(agencyId, role);
        Reservation reservation = bookingService.demanderAnnulationAgence(
                reservationId, authenticatedAgencyId, Long.parseLong(userId), request != null ? request.getMotif() : null);
        return ResponseEntity.ok(BookingDto.ApiResponse.ok(
                "Demande d'annulation envoyee a l'hebergement.", bookingService.toResponse(reservation)));
    }

    @PostMapping("/hotel/reservations/{reservationId}/annulation-decision")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> decideCancellation(
            @PathVariable Long reservationId,
            @RequestHeader(value = "X-Hotel-Id", required = false) String hotelId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody BookingDto.CancellationDecisionRequest request) {
        Reservation reservation = bookingService.getById(reservationId);
        authorizeHotel(reservation, hotelId, userId, role);
        if (reservation.getSource() != Reservation.ReservationSource.AGENCE) {
            throw new BookingException("Cette reservation ne provient pas d'une agence.", 409);
        }
        Reservation updated = bookingService.deciderAnnulation(
                reservationId, request.getAcceptee(), request.getMotifRefus());
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Decision enregistree.", bookingService.toResponse(updated)));
    }

    private Long authorizeAgency(String agencyId, String role) {
        if (!("AGENCY_ADMIN".equals(role) || "AGENCY_STAFF".equals(role))) {
            throw new BookingException("Accès agence refusé.", 403);
        }
        try {
            return Long.parseLong(agencyId);
        } catch (NumberFormatException e) {
            throw new BookingException("Agence non associée à cet utilisateur.", 403);
        }
    }

    private void authorizeHotelInvoice(Facture facture, String hotelId, String role) {
        if ("SUPER_ADMIN".equals(role)) return;
        if (!("HEBERGEMENT_ADMIN".equals(role) || "HEBERGEMENT_STAFF".equals(role)) || hotelId == null) {
            throw new BookingException("Acces facture refuse.", 403);
        }
        try {
            if (!facture.getHotelId().equals(Long.parseLong(hotelId))) {
                throw new BookingException("Acces facture refuse.", 403);
            }
        } catch (NumberFormatException e) {
            throw new BookingException("Hebergement non associe a cet utilisateur.", 403);
        }
    }

    private void authorizeHotel(Reservation reservation, String authenticatedHotelId, String userId, String role) {
        if ("SUPER_ADMIN".equals(role)) return;
        if (!("HEBERGEMENT_ADMIN".equals(role) || "HEBERGEMENT_STAFF".equals(role))) {
            throw new BookingException("Acces hebergement refuse.", 403);
        }
        if (authenticatedHotelId != null) {
            try {
                if (reservation.getHotelId().equals(Long.parseLong(authenticatedHotelId))) return;
            } catch (NumberFormatException ignored) {
                throw new BookingException("Hebergement non associe a cet utilisateur.", 403);
            }
        }
        if ("HEBERGEMENT_ADMIN".equals(role)) {
            try {
                HebergementApiResponse response = hebergementClient.getById(reservation.getHotelId());
                Long ownerUserId = response != null && response.isSuccess() && response.getData() != null
                        ? response.getData().getUserId() : null;
                if (ownerUserId != null && ownerUserId.equals(Long.parseLong(userId))) return;
            } catch (NumberFormatException ignored) {
                throw new BookingException("Compte utilisateur invalide.", 403);
            } catch (Exception e) {
                throw new BookingException("Impossible de verifier l'hebergement.", 503);
            }
        }
        throw new BookingException("Reservation introuvable pour cet hebergement.", 404);
    }

    @PostMapping("/reservations/create")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> create(
            @Valid @RequestBody BookingDto.CreateReservationRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Reservation r = bookingService.createReservation(req, userId != null ? Long.parseLong(userId) : null);
        return ResponseEntity.status(201).body(BookingDto.ApiResponse.ok("Réservation créée.", bookingService.toResponse(r)));
    }

    @GetMapping("/reservations/{id}")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", bookingService.toResponse(bookingService.getById(id))));
    }

    @GetMapping("/reservations/numero/{numero}")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> getByNumero(@PathVariable("numero") String numero) {
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", bookingService.toResponse(bookingService.getByNumero(numero))));
    }

    @GetMapping("/reservations/hotel/{hotelId}")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.ReservationResponse>>> getByHotel(@PathVariable("hotelId") Long hotelId) {
        List<BookingDto.ReservationResponse> list = bookingService.getByHotel(hotelId).stream().map(bookingService::toResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/reservations/my")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.ReservationResponse>>> getMyReservations(
            @RequestHeader("X-User-Id") String userId) {
        List<BookingDto.ReservationResponse> list = bookingService.getByUser(Long.parseLong(userId)).stream().map(bookingService::toResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/reservations/agency/{agencyId}")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.ReservationResponse>>> getByAgency(
            @PathVariable("agencyId") Long agencyId,
            @RequestHeader("X-Agency-Id") String authenticatedAgencyId,
            @RequestHeader("X-User-Role") String role) {
        Long scopedAgencyId = authorizeAgency(authenticatedAgencyId, role);
        if (!agencyId.equals(scopedAgencyId)) throw new BookingException("Accès agence refusé.", 403);
        List<BookingDto.ReservationResponse> list = bookingService.getByAgency(scopedAgencyId).stream().map(bookingService::toResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/reservations/hotel/{hotelId}/checkins-today")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.ReservationResponse>>> checkinsDuJour(@PathVariable("hotelId") Long hotelId) {
        List<BookingDto.ReservationResponse> list = bookingService.getCheckinsDuJour(hotelId).stream().map(bookingService::toResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/reservations/hotel/{hotelId}/checkouts-today")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.ReservationResponse>>> checkoutsDuJour(@PathVariable("hotelId") Long hotelId) {
        List<BookingDto.ReservationResponse> list = bookingService.getCheckoutsDuJour(hotelId).stream().map(bookingService::toResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @PostMapping("/reservations/{id}/confirmer")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> confirmer(@PathVariable("id") Long id) {
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Confirmée.", bookingService.toResponse(bookingService.confirmer(id))));
    }

    @PostMapping("/reservations/{id}/checkin")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> checkin(@PathVariable("id") Long id) {
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Check-in effectué.", bookingService.toResponse(bookingService.checkin(id))));
    }

    @PostMapping("/reservations/{id}/checkout")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> checkout(@PathVariable("id") Long id) {
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Check-out effectué.", bookingService.toResponse(bookingService.checkout(id))));
    }

    @PostMapping("/reservations/{id}/annuler")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> annuler(@PathVariable("id") Long id) {
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Annulée.", bookingService.toResponse(bookingService.annuler(id))));
    }

    @PostMapping("/reservations/{id}/paiement")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> enregistrerPaiement(
            @PathVariable("id") Long id, @Valid @RequestBody BookingDto.PaiementRequest req) {
        Reservation r = bookingService.enregistrerPaiement(id, req.getMontant(), req.getMethode());
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Paiement enregistré.", bookingService.toResponse(r)));
    }

    @PatchMapping("/reservations/{id}/prolonger")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> prolonger(
            @PathVariable("id") Long id,
            @RequestParam("nouvelleDateDepart") String nouvelleDateDepart) {
        LocalDate date = LocalDate.parse(nouvelleDateDepart);
        Reservation r = bookingService.prolonger(id, date);
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Réservation prolongée.", bookingService.toResponse(r)));
    }

    // ── Factures ──────────────────────────────────────────────
    @GetMapping("/factures/hotel/{hotelId}")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.FactureResponse>>> getFacturesByHotel(
            @PathVariable("hotelId") Long hotelId) {
        List<BookingDto.FactureResponse> list = bookingService.getFacturesByHotel(hotelId)
                .stream().map(bookingService::toFactureResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/reservations/{id}/factures")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.FactureResponse>>> getFacturesByReservation(
            @PathVariable("id") Long id) {
        List<BookingDto.FactureResponse> list = bookingService.getFacturesByReservation(id)
                .stream().map(bookingService::toFactureResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @PatchMapping("/factures/{id}/statut")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.FactureResponse>> updateFactureStatut(
            @PathVariable("id") Long id, @RequestParam Facture.StatutFacture statut,
            @RequestParam(required = false) Facture.MethodePaiement methode,
            @RequestHeader(value = "X-Hotel-Id", required = false) String hotelId,
            @RequestHeader("X-User-Role") String role) {
        authorizeHotelInvoice(bookingService.getFactureById(id), hotelId, role);
        Facture f = statut == Facture.StatutFacture.PAYEE
                ? bookingService.enregistrerPaiementFacture(id, methode)
                : bookingService.updateFactureStatut(id, statut);
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Statut mis à jour.", bookingService.toFactureResponse(f)));
    }

    @PostMapping("/factures/{id}/paiement")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.FactureResponse>> payHotelFacture(
            @PathVariable Long id,
            @RequestHeader(value = "X-Hotel-Id", required = false) String hotelId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody BookingDto.PaiementFactureRequest request) {
        authorizeHotelInvoice(bookingService.getFactureById(id), hotelId, role);
        Facture updated = bookingService.enregistrerPaiementFacture(id, request.getMethode());
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Paiement enregistre.", bookingService.toFactureResponse(updated)));
    }

    @GetMapping("/factures/{id}/pdf")
    public ResponseEntity<byte[]> downloadFacturePdf(@PathVariable("id") Long id) {
        Facture facture = bookingService.getFactureById(id);
        byte[] pdf = bookingService.genererFacturePdf(facture);
        String filename = facture.getNumeroFacture() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // ── Réservations de services ────────────────────────────────
    @PostMapping("/reservations-services/create")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationServiceResponse>> createReservationService(
            @Valid @RequestBody BookingDto.CreateReservationServiceRequest req) {
        ReservationService rs = bookingService.createReservationService(req);
        return ResponseEntity.status(201).body(BookingDto.ApiResponse.ok("Réservation de service créée.", bookingService.toReservationServiceResponse(rs)));
    }

    @GetMapping("/reservations-services/{id}")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationServiceResponse>> getReservationServiceById(
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK",
                bookingService.toReservationServiceResponse(bookingService.getReservationServiceById(id))));
    }

    @GetMapping("/reservations-services/hotel/{hotelId}")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.ReservationServiceResponse>>> getReservationsServicesByHotel(
            @PathVariable("hotelId") Long hotelId) {
        List<BookingDto.ReservationServiceResponse> list = bookingService.getReservationsServicesByHotel(hotelId)
                .stream().map(bookingService::toReservationServiceResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/reservations/{id}/services")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.ReservationServiceResponse>>> getReservationsServicesByReservation(
            @PathVariable("id") Long id) {
        List<BookingDto.ReservationServiceResponse> list = bookingService.getReservationsServicesByReservation(id)
                .stream().map(bookingService::toReservationServiceResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @PostMapping("/reservations-services/{id}/confirmer")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationServiceResponse>> confirmerReservationService(
            @PathVariable("id") Long id) {
        ReservationService rs = bookingService.confirmerReservationService(id);
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Confirmée.", bookingService.toReservationServiceResponse(rs)));
    }

    @PostMapping("/reservations-services/{id}/terminer")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationServiceResponse>> terminerReservationService(
            @PathVariable("id") Long id) {
        ReservationService rs = bookingService.terminerReservationService(id);
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Terminée.", bookingService.toReservationServiceResponse(rs)));
    }

    @PostMapping("/reservations-services/{id}/annuler")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationServiceResponse>> annulerReservationService(
            @PathVariable("id") Long id) {
        ReservationService rs = bookingService.annulerReservationService(id);
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Annulée.", bookingService.toReservationServiceResponse(rs)));
    }

    @PostMapping("/reservations-services/{id}/paiement")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationServiceResponse>> enregistrerPaiementService(
            @PathVariable("id") Long id, @Valid @RequestBody BookingDto.PaiementServiceRequest req) {
        ReservationService rs = bookingService.enregistrerPaiementService(id, req.getMontant(), req.getMethode());
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Paiement enregistré.", bookingService.toReservationServiceResponse(rs)));
    }

    @PostMapping("/reservations-services/{id}/facturer-chambre")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationServiceResponse>> factureALaChambre(
            @PathVariable("id") Long id) {
        ReservationService rs = bookingService.factureALaChambre(id);
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("Facturé à la chambre.", bookingService.toReservationServiceResponse(rs)));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() { return ResponseEntity.ok("booking-service UP"); }

    @GetMapping("/public/disponibilite/{hotelId}")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.DisponibiliteTypeResponse>>> checkDisponibilitePublique(
            @PathVariable("hotelId") Long hotelId,
            @RequestParam("dateArrivee") String dateArrivee,
            @RequestParam("dateDepart") String dateDepart) {
        List<BookingDto.DisponibiliteTypeResponse> result = bookingService.checkDisponibilitePublique(
                hotelId, LocalDate.parse(dateArrivee), LocalDate.parse(dateDepart));
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", result));
    }

    @PostMapping("/public/reserver")
    public ResponseEntity<BookingDto.ApiResponse<BookingDto.ReservationResponse>> reserverPublic(
            @Valid @RequestBody BookingDto.PublicReservationRequest req) {
        Reservation r = bookingService.creerReservationPublique(req);
        return ResponseEntity.status(201).body(BookingDto.ApiResponse.ok("Demande de reservation envoyee.", bookingService.toResponse(r)));
    }

    @GetMapping("/reservations/all")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.ReservationResponse>>> getAll() {
        List<BookingDto.ReservationResponse> list = bookingService.getAll().stream().map(bookingService::toResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/factures/all")
    public ResponseEntity<BookingDto.ApiResponse<List<BookingDto.FactureResponse>>> getAllFactures() {
        List<BookingDto.FactureResponse> list = bookingService.getAllFactures().stream().map(bookingService::toFactureResponse).toList();
        return ResponseEntity.ok(BookingDto.ApiResponse.ok("OK", list));
    }
    
}
