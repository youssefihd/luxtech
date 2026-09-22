package com.luxtech.message.exception;

import lombok.Getter;

@Getter
public class MessageException extends RuntimeException {

    private final int statusCode;

    public MessageException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}