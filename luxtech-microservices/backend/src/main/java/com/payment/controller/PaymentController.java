package com.payment.controller;

import com.payment.dto.PaymentRequestDto;
import com.payment.dto.PaymentResponseDto;
import com.payment.dto.ReversalRequestDto;
import com.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing payment operations.
 *
 * Endpoints:
 *   POST /api/payments/authorize  — Authorization only (hold funds)
 *   POST /api/payments/purchase   — Purchase (auth + capture)
 *   POST /api/payments/reverse    — Reverse a previous transaction
 *   GET  /api/payments/health     — Health check
 */
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*") // For development — restrict in production
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Authorization request — puts a hold on the card without capturing funds.
     */
    @PostMapping("/authorize")
    public ResponseEntity<PaymentResponseDto> authorize(@Valid @RequestBody PaymentRequestDto request) {
        log.info("POST /api/payments/authorize");
        PaymentResponseDto response = paymentService.authorize(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Purchase request — authorization and capture in one step.
     */
    @PostMapping("/purchase")
    public ResponseEntity<PaymentResponseDto> purchase(@Valid @RequestBody PaymentRequestDto request) {
        log.info("POST /api/payments/purchase");
        PaymentResponseDto response = paymentService.purchase(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Reversal request — reverse a previous authorization or purchase.
     */
    @PostMapping("/reverse")
    public ResponseEntity<PaymentResponseDto> reverse(@Valid @RequestBody ReversalRequestDto request) {
        log.info("POST /api/payments/reverse");
        PaymentResponseDto response = paymentService.reverse(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ISO 8583 Payment Gateway is running");
    }
}
