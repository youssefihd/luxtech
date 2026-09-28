package com.payment.service;

import com.payment.dto.PaymentRequestDto;
import com.payment.dto.PaymentResponseDto;
import com.payment.dto.ReversalRequestDto;
import com.payment.enums.CurrencyCode;
import com.payment.model.PaymentRequest;
import com.payment.model.PaymentResponse;
import com.payment.processor.PaymentProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Payment orchestration service.
 *
 * Responsibilities:
 * - Generate unique identifiers (STAN, transaction ID)
 * - Map DTOs ↔ domain models
 * - Delegate to PaymentProcessor (interface — not tied to ISO 8583)
 * - Log transactions for audit trail
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentProcessor paymentProcessor;

    /**
     * STAN counter — in production this would be persisted and reset daily.
     * STAN is 6 digits (000001–999999), cycling back to 000001 after 999999.
     */
    private final AtomicLong stanCounter = new AtomicLong(0);

    public PaymentService(PaymentProcessor paymentProcessor) {
        this.paymentProcessor = paymentProcessor;
    }

    // ── Public API ─────────────────────────────────────────────

    /**
     * Process an authorization request (hold funds, no capture).
     */
    public PaymentResponseDto authorize(PaymentRequestDto dto) {
        log.info("Authorization request: PAN={}****, amount={} {}",
                maskForLog(dto.getCardNumber()), dto.getAmount(), dto.getCurrencyCode());

        PaymentRequest request = mapToRequest(dto);
        PaymentResponse response = paymentProcessor.authorize(request);

        return mapToResponseDto(response, request, dto);
    }

    /**
     * Process a purchase request (authorization + capture).
     */
    public PaymentResponseDto purchase(PaymentRequestDto dto) {
        log.info("Purchase request: PAN={}****, amount={} {}",
                maskForLog(dto.getCardNumber()), dto.getAmount(), dto.getCurrencyCode());

        PaymentRequest request = mapToRequest(dto);
        PaymentResponse response = paymentProcessor.purchase(request);

        return mapToResponseDto(response, request, dto);
    }

    /**
     * Reverse a previous transaction.
     */
    public PaymentResponseDto reverse(ReversalRequestDto dto) {
        log.info("Reversal request: originalTxn={}, amount={} {}",
                dto.getOriginalTransactionId(), dto.getOriginalAmount(), dto.getCurrencyCode());

        CurrencyCode currency = CurrencyCode.fromNumericCode(dto.getCurrencyCode());

        PaymentRequest request = new PaymentRequest();
        request.setStan(generateStan());
        request.setAmountMinorUnits(currency.toMinorUnits(dto.getOriginalAmount()));
        request.setCurrency(currency);
        request.setRetrievalRefNumber(dto.getOriginalRrn());
        // PAN is not re-sent in reversals — the RRN identifies the original transaction

        PaymentResponse response = paymentProcessor.reverse(request);

        PaymentResponseDto responseDto = new PaymentResponseDto();
        responseDto.approved(response.isApproved())
                .responseCode(response.getResponseCode().getCode())
                .responseMessage(response.getResponseCode().getDescription())
                .authorizationCode(response.getAuthorizationCode())
                .retrievalReferenceNumber(response.getRetrievalRefNumber())
                .transactionId(UUID.randomUUID().toString())
                .amount(dto.getOriginalAmount())
                .currencyCode(dto.getCurrencyCode());

        return responseDto;
    }

    // ── Mapping helpers ────────────────────────────────────────

    private PaymentRequest mapToRequest(PaymentRequestDto dto) {
        CurrencyCode currency = CurrencyCode.fromNumericCode(dto.getCurrencyCode());

        PaymentRequest request = new PaymentRequest();
        request.setPan(dto.getCardNumber());
        request.setExpiryDate(dto.getExpiryDate());
        request.setAmountMinorUnits(currency.toMinorUnits(dto.getAmount()));
        request.setCurrency(currency);
        request.setStan(generateStan());
        request.setTerminalId(dto.getTerminalId());
        request.setMerchantId(dto.getMerchantId());
        request.setRetrievalRefNumber(generateRrn());

        return request;
    }

    private PaymentResponseDto mapToResponseDto(PaymentResponse response,
                                                 PaymentRequest request,
                                                 PaymentRequestDto dto) {
        return new PaymentResponseDto()
                .approved(response.isApproved())
                .responseCode(response.getResponseCode().getCode())
                .responseMessage(response.getResponseCode().getDescription())
                .authorizationCode(response.getAuthorizationCode())
                .retrievalReferenceNumber(response.getRetrievalRefNumber())
                .maskedPan(request.getMaskedPan())
                .amount(dto.getAmount())
                .currencyCode(dto.getCurrencyCode())
                .transactionId(UUID.randomUUID().toString());
    }

    // ── Identifier generation ──────────────────────────────────

    private String generateStan() {
        long next = stanCounter.incrementAndGet();
        if (next > 999999) {
            stanCounter.set(1);
            next = 1;
        }
        return String.format("%06d", next);
    }

    private String generateRrn() {
        // 12-character alphanumeric — timestamp-based for uniqueness
        return String.format("%012d", System.currentTimeMillis() % 1_000_000_000_000L);
    }

    private String maskForLog(String pan) {
        if (pan == null || pan.length() < 6) return "****";
        return pan.substring(0, 6);
    }
}
