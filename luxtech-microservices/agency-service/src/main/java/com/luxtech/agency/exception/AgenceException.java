package com.luxtech.agency.exception;
import lombok.Getter;
@Getter
public class AgenceException extends RuntimeException {
    private final int statusCode;
    public AgenceException(String message, int statusCode) { super(message); this.statusCode = statusCode; }
}