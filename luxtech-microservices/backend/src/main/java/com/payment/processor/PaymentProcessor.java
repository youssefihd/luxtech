package com.payment.processor;

import com.payment.model.PaymentRequest;
import com.payment.model.PaymentResponse;

/**
 * Strategy interface for payment processing.
 *
 * Implementations can connect to different processors:
 * - Iso8583PaymentProcessor: ISO 8583 over TCP/IP (this project)
 * - RestPaymentProcessor:    REST-based processor (future)
 * - MockPaymentProcessor:    In-memory mock for testing
 *
 * The PaymentService depends on this interface, not on any
 * concrete implementation — enabling easy swapping via Spring config.
 */
public interface PaymentProcessor {

    /**
     * Send an authorization-only request (holds funds, does not capture).
     * MTI: 0100 → 0110
     */
    PaymentResponse authorize(PaymentRequest request);

    /**
     * Send a purchase request (authorization + capture in one step).
     * MTI: 0200 → 0210
     */
    PaymentResponse purchase(PaymentRequest request);

    /**
     * Reverse a previous authorization or purchase.
     * MTI: 0400 → 0410
     */
    PaymentResponse reverse(PaymentRequest request);
}
