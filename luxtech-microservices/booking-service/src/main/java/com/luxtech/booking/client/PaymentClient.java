package com.luxtech.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.math.BigDecimal;

@FeignClient(name = "payment-service")
public interface PaymentClient {

    @PostMapping("/api/payment/manual")
    PaymentApiResponse enregistrerPaiementManuel(@RequestBody ManualPaymentDto req);

    class ManualPaymentDto {
        public Long reservationId;
        public Long reservationServiceId;
        public Long hotelId;
        public String clientNom;
        public BigDecimal montant;
        public String modePaiement;
        public String notes;
    }
}