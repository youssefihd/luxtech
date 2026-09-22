package com.luxtech.auth.exception;
import lombok.Getter;
@Getter
public class AuthException extends RuntimeException {
    private final int statusCode;
    public AuthException(String message, int statusCode) { super(message); this.statusCode = statusCode; }
}
