package com.payment.model;

import com.payment.enums.ResponseCode;

/**
 * Internal domain model for a payment response from the processor.
 */
public class PaymentResponse {

    private ResponseCode responseCode;
    private String authorizationCode;    // DE38
    private String retrievalRefNumber;   // DE37
    private String stan;                 // DE11
    private boolean approved;
    private String rawResponseCode;      // Original DE39 value

    // -- Constructors --

    public PaymentResponse() {}

    public PaymentResponse(ResponseCode responseCode) {
        this.responseCode = responseCode;
        this.rawResponseCode = responseCode.getCode();
        this.approved = responseCode.isApproved();
    }

    // -- Getters / Setters --

    public ResponseCode getResponseCode() { return responseCode; }
    public void setResponseCode(ResponseCode responseCode) {
        this.responseCode = responseCode;
        this.approved = responseCode.isApproved();
    }

    public String getAuthorizationCode() { return authorizationCode; }
    public void setAuthorizationCode(String authorizationCode) { this.authorizationCode = authorizationCode; }

    public String getRetrievalRefNumber() { return retrievalRefNumber; }
    public void setRetrievalRefNumber(String retrievalRefNumber) { this.retrievalRefNumber = retrievalRefNumber; }

    public String getStan() { return stan; }
    public void setStan(String stan) { this.stan = stan; }

    public boolean isApproved() { return approved; }

    public String getRawResponseCode() { return rawResponseCode; }
    public void setRawResponseCode(String rawResponseCode) { this.rawResponseCode = rawResponseCode; }
}
