package com.luxtech.booking.client;

import lombok.Data;

@Data
public class PaymentApiResponse {
    private boolean success;
    private String message;
    private Object data;
}