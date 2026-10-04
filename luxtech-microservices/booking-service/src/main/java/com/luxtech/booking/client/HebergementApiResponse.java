package com.luxtech.booking.client;

import lombok.Data;

@Data
public class HebergementApiResponse {
    private boolean success;
    private String message;
    private HebergementData data;

    @Data
    public static class HebergementData {
        private Long id;
        private String nom;
        private String nomLegal;
        private String adresse;
        private String ville;
        private String pays;
        private String codePostal;
        private String telephone;
        private String email;
        private String logoUrl;
        private String numeroFiscal;
        private String rc;
        private String patente;
        private String cnss;
        private String ice;
        private Long userId;
        private java.math.BigDecimal commissionTaux;
    }
}