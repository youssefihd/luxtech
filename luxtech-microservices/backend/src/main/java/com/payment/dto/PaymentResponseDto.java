package com.payment.dto;

import java.time.LocalDateTime;

/**
 * Outbound payment response to the React frontend.
 */
public class PaymentResponseDto {

    private boolean approved;
    private String responseCode;
    private String responseMessage;
    private String authorizationCode;
    private String retrievalReferenceNumber;
    private String maskedPan;
    private Double amount;
    private String currencyCode;
    private String transactionId;
    private LocalDateTime timestamp;

    // -- Constructors --

    public PaymentResponseDto() {
        this.timestamp = LocalDateTime.now();
    }

    // -- Builder-style setters --

    public PaymentResponseDto approved(boolean approved) { this.approved = approved; return this; }
    public PaymentResponseDto responseCode(String code) { this.responseCode = code; return this; }
    public PaymentResponseDto responseMessage(String msg) { this.responseMessage = msg; return this; }
    public PaymentResponseDto authorizationCode(String code) { this.authorizationCode = code; return this; }
    public PaymentResponseDto retrievalReferenceNumber(String rrn) { this.retrievalReferenceNumber = rrn; return this; }
    public PaymentResponseDto maskedPan(String pan) { this.maskedPan = pan; return this; }
    public PaymentResponseDto amount(Double amount) { this.amount = amount; return this; }
    public PaymentResponseDto currencyCode(String code) { this.currencyCode = code; return this; }
    public PaymentResponseDto transactionId(String id) { this.transactionId = id; return this; }

    // -- Getters --

    public boolean isApproved() { return approved; }
    public String getResponseCode() { return responseCode; }
    public String getResponseMessage() { return responseMessage; }
    public String getAuthorizationCode() { return authorizationCode; }
    public String getRetrievalReferenceNumber() { return retrievalReferenceNumber; }
    public String getMaskedPan() { return maskedPan; }
    public Double getAmount() { return amount; }
    public String getCurrencyCode() { return currencyCode; }
    public String getTransactionId() { return transactionId; }
    public LocalDateTime getTimestamp() { return timestamp; }

    // -- Setters --

    public void setApproved(boolean approved) { this.approved = approved; }
    public void setResponseCode(String responseCode) { this.responseCode = responseCode; }
    public void setResponseMessage(String responseMessage) { this.responseMessage = responseMessage; }
    public void setAuthorizationCode(String authorizationCode) { this.authorizationCode = authorizationCode; }
    public void setRetrievalReferenceNumber(String retrievalReferenceNumber) { this.retrievalReferenceNumber = retrievalReferenceNumber; }
    public void setMaskedPan(String maskedPan) { this.maskedPan = maskedPan; }
    public void setAmount(Double amount) { this.amount = amount; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
