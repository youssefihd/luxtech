package com.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request to reverse a previous transaction.
 */
public class ReversalRequestDto {

    @NotBlank(message = "Original transaction ID is required")
    private String originalTransactionId;

    @NotBlank(message = "Original retrieval reference number is required")
    private String originalRrn;

    @NotNull(message = "Original amount is required")
    private Double originalAmount;

    @NotBlank(message = "Currency code is required")
    private String currencyCode;

    private String reason;

    // -- Constructors --

    public ReversalRequestDto() {}

    // -- Getters / Setters --

    public String getOriginalTransactionId() { return originalTransactionId; }
    public void setOriginalTransactionId(String id) { this.originalTransactionId = id; }

    public String getOriginalRrn() { return originalRrn; }
    public void setOriginalRrn(String rrn) { this.originalRrn = rrn; }

    public Double getOriginalAmount() { return originalAmount; }
    public void setOriginalAmount(Double amount) { this.originalAmount = amount; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String code) { this.currencyCode = code; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
