package com.luxtech.booking.client;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ServiceApiResponse {
    private boolean success;
    private String message;
    private ServiceData data;

    @Data
    public static class ServiceData {
        private Long id;
        private String nom;
        private String description;
        private String categorie;
        private BigDecimal prix;
        private Integer duree;
        private Integer capaciteMax;
        private String imageUrl;
        private Boolean isActive;
        private Long hotelId;
    }
}