package com.luxtech.booking.exception;
import lombok.Getter;
@Getter
public class BookingException extends RuntimeException {
    private final int statusCode;
    public BookingException(String message, int statusCode) { super(message); this.statusCode = statusCode; }
}
