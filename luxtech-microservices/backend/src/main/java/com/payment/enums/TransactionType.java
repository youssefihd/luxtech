package com.payment.enums;

/**
 * Transaction types mapped to ISO 8583 Processing Code (DE3) values.
 * The processing code is 6 digits: TTFFAA
 *   TT = transaction type (00=purchase, 01=cash, 20=refund)
 *   FF = from-account (00=default, 10=savings, 20=checking)
 *   AA = to-account
 */
public enum TransactionType {

    PURCHASE("000000", "0200"),
    AUTHORIZATION("000000", "0100"),
    CASH_ADVANCE("010000", "0200"),
    REFUND("200000", "0200"),
    REVERSAL("000000", "0400"),
    BALANCE_INQUIRY("310000", "0100");

    private final String processingCode;
    private final String mti;

    TransactionType(String processingCode, String mti) {
        this.processingCode = processingCode;
        this.mti = mti;
    }

    public String getProcessingCode() {
        return processingCode;
    }

    /** The MTI (Message Type Indicator) for the request message. */
    public String getMti() {
        return mti;
    }

    /** Returns the expected response MTI (request MTI + 10). */
    public String getResponseMti() {
        int mtiValue = Integer.parseInt(mti);
        return String.format("%04d", mtiValue + 10);
    }
}
