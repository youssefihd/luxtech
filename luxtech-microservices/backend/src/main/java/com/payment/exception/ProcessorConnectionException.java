package com.payment.exception;

/**
 * Thrown when the gateway cannot connect to or communicate with the processor.
 */
public class ProcessorConnectionException extends RuntimeException {

    public ProcessorConnectionException(String message) {
        super(message);
    }

    public ProcessorConnectionException(String message, Throwable cause) {
        super(message, cause);
    }
}
