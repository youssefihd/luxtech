package com.luxtech.booking.client;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AgencyApiResponse {
    private boolean success;
    private String message;
    private AgencyData data;

    @Data
    public static class AgencyData {
        private Long id;
        private String nomAgence;
        private BigDecimal commissionTaux;
    }
}
