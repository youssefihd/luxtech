package com.payment.model;

import com.payment.enums.CurrencyCode;
import com.payment.enums.TransactionType;

/**
 * Internal domain model for a payment request.
 * This is what the PaymentProcessor interface works with.
 */
public class PaymentRequest {

    private String pan;                  // Primary Account Number
    private String expiryDate;           // YYMM
    private long amountMinorUnits;       // Amount in minor units (cents/centimes)
    private CurrencyCode currency;
    private TransactionType transactionType;
    private String stan;                 // System Trace Audit Number (6 digits)
    private String terminalId;           // DE41
    private String merchantId;           // DE42
    private String merchantName;         // DE43
    private String retrievalRefNumber;   // DE37

    // -- Constructors --

    public PaymentRequest() {}

    // -- Getters / Setters --

    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public long getAmountMinorUnits() { return amountMinorUnits; }
    public void setAmountMinorUnits(long amountMinorUnits) { this.amountMinorUnits = amountMinorUnits; }

    public CurrencyCode getCurrency() { return currency; }
    public void setCurrency(CurrencyCode currency) { this.currency = currency; }

    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }

    public String getStan() { return stan; }
    public void setStan(String stan) { this.stan = stan; }

    public String getTerminalId() { return terminalId; }
    public void setTerminalId(String terminalId) { this.terminalId = terminalId; }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }

    public String getMerchantName() { return merchantName; }
    public void setMerchantName(String merchantName) { this.merchantName = merchantName; }

    public String getRetrievalRefNumber() { return retrievalRefNumber; }
    public void setRetrievalRefNumber(String retrievalRefNumber) { this.retrievalRefNumber = retrievalRefNumber; }

    /** Mask PAN for logging: 4111111111111111 → 411111******1111 */
    public String getMaskedPan() {
        if (pan == null || pan.length() < 10) return "****";
        return pan.substring(0, 6) + "******" + pan.substring(pan.length() - 4);
    }
}
