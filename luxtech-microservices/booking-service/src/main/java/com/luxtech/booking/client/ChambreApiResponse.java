package com.luxtech.booking.client;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ChambreApiResponse {
    private boolean success;
    private String message;
    private java.util.List<ChambreData> data;

    @Data
    public static class ChambreData {
        private Long id;
        private String numero;
        private String status;
        private Long chambreTypeId;
        private String chambreTypeNom;
        private String chambreTypeDescription;
        private String chambreTypeImagesUrls;
        private BigDecimal prixBase;
        private BigDecimal prixNuitee;
        private Integer capaciteAdultes;
        private Integer capaciteEnfants;
        private String amenities;
    }
}