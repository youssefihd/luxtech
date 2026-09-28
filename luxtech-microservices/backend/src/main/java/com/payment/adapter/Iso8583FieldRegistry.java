package com.payment.adapter;

import com.payment.adapter.Iso8583FieldDefinition.DataType;
import com.payment.adapter.Iso8583FieldDefinition.LengthType;

import java.util.HashMap;
import java.util.Map;

/**
 * Registry of ISO 8583:1987 data element definitions.
 *
 * This maps each field number to its encoding rules (type, length, format).
 * In a production system, this would be loaded from a configuration file
 * (e.g., jPOS uses XML packagers). Here we define the most common fields.
 */
public class Iso8583FieldRegistry {

    private static final Map<Integer, Iso8583FieldDefinition> FIELDS = new HashMap<>();

    static {
        // DE2  - Primary Account Number (PAN)
        register(2, "Primary Account Number", DataType.NUMERIC, LengthType.LLVAR, 19);

        // DE3  - Processing Code
        register(3, "Processing Code", DataType.NUMERIC, LengthType.FIXED, 6);

        // DE4  - Amount, Transaction
        register(4, "Transaction Amount", DataType.NUMERIC, LengthType.FIXED, 12);

        // DE7  - Transmission Date & Time (MMDDhhmmss)
        register(7, "Transmission Date/Time", DataType.NUMERIC, LengthType.FIXED, 10);

        // DE11 - System Trace Audit Number (STAN)
        register(11, "STAN", DataType.NUMERIC, LengthType.FIXED, 6);

        // DE12 - Local Transaction Time (hhmmss)
        register(12, "Local Transaction Time", DataType.NUMERIC, LengthType.FIXED, 6);

        // DE13 - Local Transaction Date (MMDD)
        register(13, "Local Transaction Date", DataType.NUMERIC, LengthType.FIXED, 4);

        // DE14 - Expiration Date (YYMM)
        register(14, "Expiration Date", DataType.NUMERIC, LengthType.FIXED, 4);

        // DE22 - Point of Service Entry Mode
        register(22, "POS Entry Mode", DataType.NUMERIC, LengthType.FIXED, 3);

        // DE23 - Card Sequence Number
        register(23, "Card Sequence Number", DataType.NUMERIC, LengthType.FIXED, 3);

        // DE25 - Point of Service Condition Code
        register(25, "POS Condition Code", DataType.NUMERIC, LengthType.FIXED, 2);

        // DE35 - Track 2 Data
        register(35, "Track 2 Data", DataType.ALPHA_SPECIAL, LengthType.LLVAR, 37);

        // DE37 - Retrieval Reference Number
        register(37, "Retrieval Reference Number", DataType.ALPHA_NUMERIC, LengthType.FIXED, 12);

        // DE38 - Authorization Identification Response (auth code)
        register(38, "Authorization Code", DataType.ALPHA_NUMERIC, LengthType.FIXED, 6);

        // DE39 - Response Code
        register(39, "Response Code", DataType.ALPHA_NUMERIC, LengthType.FIXED, 2);

        // DE41 - Card Acceptor Terminal Identification
        register(41, "Terminal ID", DataType.ALPHA_SPECIAL, LengthType.FIXED, 8);

        // DE42 - Card Acceptor Identification Code (Merchant ID)
        register(42, "Merchant ID", DataType.ALPHA_SPECIAL, LengthType.FIXED, 15);

        // DE43 - Card Acceptor Name/Location
        register(43, "Merchant Name/Location", DataType.ALPHA_SPECIAL, LengthType.FIXED, 40);

        // DE49 - Currency Code, Transaction
        register(49, "Currency Code", DataType.NUMERIC, LengthType.FIXED, 3);

        // DE52 - PIN Data (encrypted)
        register(52, "PIN Data", DataType.BINARY, LengthType.FIXED, 8);

        // DE54 - Additional Amounts
        register(54, "Additional Amounts", DataType.ALPHA_SPECIAL, LengthType.LLLVAR, 120);
    }

    private static void register(int fieldNumber, String name, DataType dataType,
                                  LengthType lengthType, int maxLength) {
        FIELDS.put(fieldNumber, new Iso8583FieldDefinition(fieldNumber, name, dataType, lengthType, maxLength));
    }

    public static Iso8583FieldDefinition getField(int fieldNumber) {
        Iso8583FieldDefinition def = FIELDS.get(fieldNumber);
        if (def == null) {
            throw new IllegalArgumentException("Unknown ISO 8583 field: " + fieldNumber);
        }
        return def;
    }

    public static boolean hasField(int fieldNumber) {
        return FIELDS.containsKey(fieldNumber);
    }
}
