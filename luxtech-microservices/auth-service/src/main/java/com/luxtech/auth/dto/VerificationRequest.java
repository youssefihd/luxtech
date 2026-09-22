package com.luxtech.auth.dto;

import lombok.Data;

@Data
public class VerificationRequest {
    private String email;
    private String code;
}
