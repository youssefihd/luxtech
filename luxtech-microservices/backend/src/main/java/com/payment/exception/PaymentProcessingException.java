package com.payment.exception;

/**
 * Thrown when an error occurs during payment processing logic
 * (field mapping, validation, etc. — not a connection issue).
 */
public class PaymentProcessingException extends RuntimeException {

    public PaymentProcessingException(String message) {
        super(message);
    }

    public PaymentProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
