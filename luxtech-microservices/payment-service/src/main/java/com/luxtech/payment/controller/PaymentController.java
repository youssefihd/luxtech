package com.luxtech.payment.controller;
import com.luxtech.payment.dto.PaymentDto;
import com.luxtech.payment.entity.Abonnement;
import com.luxtech.payment.entity.Paiement;
import com.luxtech.payment.entity.Reversement;
import com.luxtech.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/payment") @RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.PaymentIntentResponse>> createIntent(
            @Valid @RequestBody PaymentDto.CreatePaymentIntentRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        PaymentDto.PaymentIntentResponse resp = paymentService.createPaymentIntent(req,
                userId != null ? Long.parseLong(userId) : null);
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("PaymentIntent créé.", resp));
    }

    @PostMapping("/confirm")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.PaiementResponse>> confirm(
            @Valid @RequestBody PaymentDto.ConfirmPaymentRequest req) {
        Paiement p = paymentService.confirmPayment(req.getPaymentIntentId());
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("Paiement confirmé.", paymentService.toResponse(p)));
    }

    @PostMapping("/manual")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.PaiementResponse>> manual(
            @Valid @RequestBody PaymentDto.ManualPaymentRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Long uid = (userId != null && !userId.isBlank()) ? Long.parseLong(userId) : null;
        Paiement p = paymentService.createManualPayment(req, uid);
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("Paiement enregistré.", paymentService.toResponse(p)));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<PaymentDto.ApiResponse<List<PaymentDto.PaiementResponse>>> getByReservation(
            @PathVariable("reservationId") Long reservationId) {
        List<PaymentDto.PaiementResponse> list = paymentService.getByReservation(reservationId)
                .stream().map(paymentService::toResponse).toList();
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<PaymentDto.ApiResponse<List<PaymentDto.PaiementResponse>>> getByHotel(
            @PathVariable("hotelId") Long hotelId) {
        List<PaymentDto.PaiementResponse> list = paymentService.getByHotel(hotelId)
                .stream().map(paymentService::toResponse).toList();
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/reservation/{reservationId}/total")
    public ResponseEntity<PaymentDto.ApiResponse<BigDecimal>> getTotal(
            @PathVariable("reservationId") Long reservationId) {
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("OK", paymentService.getMontantPayeByReservation(reservationId)));
    }

    @PostMapping("/{id}/rembourser")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.PaiementResponse>> rembourser(
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("Remboursé.", paymentService.toResponse(paymentService.rembourser(id))));
    }

    @PostMapping("/abonnements")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.AbonnementResponse>> demanderAbonnement(
            @Valid @RequestBody PaymentDto.CreateAbonnementRequest req) {
        Abonnement a = paymentService.demanderAbonnement(req.getHotelId(), req.getPlan());
        return ResponseEntity.status(201).body(PaymentDto.ApiResponse.ok("Demande envoyee.", paymentService.toAbonnementResponse(a)));
    }

    @GetMapping("/abonnements/hotel/{hotelId}")
    public ResponseEntity<PaymentDto.ApiResponse<List<PaymentDto.AbonnementResponse>>> getAbonnements(
            @PathVariable("hotelId") Long hotelId) {
        List<PaymentDto.AbonnementResponse> list = paymentService.getAbonnementsByHotel(hotelId)
                .stream().map(paymentService::toAbonnementResponse).toList();
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/abonnements/hotel/{hotelId}/actif")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.AbonnementResponse>> getAbonnementActif(
            @PathVariable("hotelId") Long hotelId) {
        Abonnement a = paymentService.getAbonnementActif(hotelId);
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("OK", a != null ? paymentService.toAbonnementResponse(a) : null));
    }

    @GetMapping("/all")
    public ResponseEntity<PaymentDto.ApiResponse<List<PaymentDto.PaiementResponse>>> getAll() {
        List<PaymentDto.PaiementResponse> list = paymentService.getAll().stream().map(paymentService::toResponse).toList();
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("OK", list));
    }

    @PostMapping("/abonnements/{id}/valider")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.AbonnementResponse>> validerAbonnement(
            @PathVariable("id") Long id) {
        Abonnement a = paymentService.validerAbonnement(id);
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("Abonnement valide.", paymentService.toAbonnementResponse(a)));
    }

    @PostMapping("/abonnements/{id}/annuler")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.AbonnementResponse>> annulerAbonnement(
            @PathVariable("id") Long id) {
        Abonnement a = paymentService.annulerAbonnement(id);
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("Abonnement annule.", paymentService.toAbonnementResponse(a)));
    }

    @GetMapping("/abonnements/actifs")
    public ResponseEntity<PaymentDto.ApiResponse<List<PaymentDto.AbonnementResponse>>> getAllActifs() {
        List<PaymentDto.AbonnementResponse> list = paymentService.getAllActifs().stream().map(paymentService::toAbonnementResponse).toList();
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("OK", list));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() { return ResponseEntity.ok("payment-service UP"); }

    @PostMapping("/reversements")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.ReversementResponse>> createReversement(
            @Valid @RequestBody PaymentDto.CreateReversementRequest req) {
        Reversement r = paymentService.createReversement(req);
        return ResponseEntity.status(201).body(PaymentDto.ApiResponse.ok("Reversement cree.", paymentService.toReversementResponse(r)));
    }

    @GetMapping("/reversements")
    public ResponseEntity<PaymentDto.ApiResponse<List<PaymentDto.ReversementResponse>>> getAllReversements() {
        List<PaymentDto.ReversementResponse> list = paymentService.getAllReversements().stream().map(paymentService::toReversementResponse).toList();
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("OK", list));
    }

    @PostMapping("/reversements/{id}/effectuer")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.ReversementResponse>> marquerEffectue(
            @PathVariable("id") Long id, @RequestBody Map<String, String> body) {
        Reversement r = paymentService.marquerReversementEffectue(id, body.get("referenceVirement"));
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("Reversement effectue.", paymentService.toReversementResponse(r)));
    }

    @PostMapping("/reversements/{id}/echec")
    public ResponseEntity<PaymentDto.ApiResponse<PaymentDto.ReversementResponse>> marquerEchec(@PathVariable("id") Long id) {
        Reversement r = paymentService.marquerReversementEchec(id);
        return ResponseEntity.ok(PaymentDto.ApiResponse.ok("Marque en echec.", paymentService.toReversementResponse(r)));
    }
}

