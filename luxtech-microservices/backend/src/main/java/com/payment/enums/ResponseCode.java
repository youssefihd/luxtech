package com.payment.enums;

/**
 * ISO 8583 Response Codes (DE39).
 * These are the standard 2-character codes returned by card processors.
 */
public enum ResponseCode {

    APPROVED("00", "Approved"),
    REFER_TO_ISSUER("01", "Refer to card issuer"),
    INVALID_MERCHANT("03", "Invalid merchant"),
    DO_NOT_HONOR("05", "Do not honor"),
    ERROR("06", "Error"),
    INVALID_TRANSACTION("12", "Invalid transaction"),
    INVALID_AMOUNT("13", "Invalid amount"),
    INVALID_CARD_NUMBER("14", "Invalid card number"),
    NO_SUCH_ISSUER("15", "No such issuer"),
    FORMAT_ERROR("30", "Format error"),
    LOST_CARD("41", "Lost card — pick up"),
    STOLEN_CARD("43", "Stolen card — pick up"),
    INSUFFICIENT_FUNDS("51", "Insufficient funds"),
    EXPIRED_CARD("54", "Expired card"),
    INCORRECT_PIN("55", "Incorrect PIN"),
    TRANSACTION_NOT_PERMITTED("57", "Transaction not permitted"),
    SUSPECTED_FRAUD("59", "Suspected fraud"),
    EXCEEDS_LIMIT("61", "Exceeds withdrawal amount limit"),
    RESTRICTED_CARD("62", "Restricted card"),
    SECURITY_VIOLATION("63", "Security violation"),
    EXCEEDS_FREQUENCY("65", "Exceeds withdrawal frequency limit"),
    SYSTEM_MALFUNCTION("96", "System malfunction"),
    UNKNOWN("99", "Unknown response");

    private final String code;
    private final String description;

    ResponseCode(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public boolean isApproved() {
        return "00".equals(code);
    }

    public static ResponseCode fromCode(String code) {
        for (ResponseCode rc : values()) {
            if (rc.code.equals(code)) {
                return rc;
            }
        }
        return UNKNOWN;
    }
}
