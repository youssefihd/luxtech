package com.payment.dto;

import jakarta.validation.constraints.*;

/**
 * Inbound payment request from the React frontend.
 */
public class PaymentRequestDto {

    @NotBlank(message = "Card number is required")
    @Pattern(regexp = "\\d{13,19}", message = "Card number must be 13-19 digits")
    private String cardNumber;

    @NotBlank(message = "Expiry date is required")
    @Pattern(regexp = "\\d{4}", message = "Expiry must be YYMM format (e.g. 2712)")
    private String expiryDate;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
    @DecimalMax(value = "999999.99", message = "Amount exceeds maximum")
    private Double amount;

    @NotBlank(message = "Currency is required")
    @Pattern(regexp = "\\d{3}", message = "Currency must be 3-digit ISO 4217 code")
    private String currencyCode;

    @Size(max = 8, message = "Terminal ID max 8 characters")
    private String terminalId;

    @Size(max = 15, message = "Merchant ID max 15 characters")
    private String merchantId;

    // -- Constructors --

    public PaymentRequestDto() {}

    public PaymentRequestDto(String cardNumber, String expiryDate, Double amount, String currencyCode) {
        this.cardNumber = cardNumber;
        this.expiryDate = expiryDate;
        this.amount = amount;
        this.currencyCode = currencyCode;
    }

    // -- Getters / Setters --

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }

    public String getTerminalId() { return terminalId; }
    public void setTerminalId(String terminalId) { this.terminalId = terminalId; }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }
}
