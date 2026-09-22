package com.luxtech.hebergement.exception;
import lombok.Getter;
@Getter
public class HebergementException extends RuntimeException {
    private final int statusCode;
    public HebergementException(String message, int statusCode) { super(message); this.statusCode = statusCode; }
}