package com.payment.adapter;

/**
 * Defines encoding rules for each ISO 8583 data element.
 *
 * In ISO 8583:1987, each field has a specific:
 * - Type: how the data is encoded (numeric, alpha, binary, variable-length)
 * - MaxLength: maximum number of characters/bytes
 * - LengthType: fixed or variable (LLVAR = 2-digit prefix, LLLVAR = 3-digit prefix)
 */
public class Iso8583FieldDefinition {

    public enum LengthType {
        FIXED,   // Field has exactly maxLength characters
        LLVAR,   // Variable length, prefixed with 2-digit length
        LLLVAR   // Variable length, prefixed with 3-digit length
    }

    public enum DataType {
        NUMERIC,        // N — right-justified, zero-padded
        ALPHA_NUMERIC,  // AN — left-justified, space-padded
        ALPHA_SPECIAL,  // ANS — left-justified, space-padded
        BINARY          // B — raw binary
    }

    private final int fieldNumber;
    private final String name;
    private final DataType dataType;
    private final LengthType lengthType;
    private final int maxLength;

    public Iso8583FieldDefinition(int fieldNumber, String name, DataType dataType,
                                   LengthType lengthType, int maxLength) {
        this.fieldNumber = fieldNumber;
        this.name = name;
        this.dataType = dataType;
        this.lengthType = lengthType;
        this.maxLength = maxLength;
    }

    public int getFieldNumber() { return fieldNumber; }
    public String getName() { return name; }
    public DataType getDataType() { return dataType; }
    public LengthType getLengthType() { return lengthType; }
    public int getMaxLength() { return maxLength; }

    /**
     * Encode a value according to this field's rules.
     * Returns the encoded string (for ASCII-based encoding).
     */
    public String encode(String value) {
        if (value == null) value = "";

        switch (lengthType) {
            case LLVAR:
                // Prefix with 2-digit length, then the value
                String llVal = value.length() > maxLength ? value.substring(0, maxLength) : value;
                return String.format("%02d", llVal.length()) + llVal;

            case LLLVAR:
                // Prefix with 3-digit length, then the value
                String lllVal = value.length() > maxLength ? value.substring(0, maxLength) : value;
                return String.format("%03d", lllVal.length()) + lllVal;

            case FIXED:
            default:
                return padOrTruncate(value);
        }
    }

    /**
     * Decode a value starting at the given offset in the message.
     * Returns [decodedValue, numberOfBytesConsumed].
     */
    public String[] decode(String message, int offset) {
        switch (lengthType) {
            case LLVAR: {
                String lenStr = message.substring(offset, offset + 2);
                int len = Integer.parseInt(lenStr);
                String val = message.substring(offset + 2, offset + 2 + len);
                return new String[]{val, String.valueOf(2 + len)};
            }
            case LLLVAR: {
                String lenStr = message.substring(offset, offset + 3);
                int len = Integer.parseInt(lenStr);
                String val = message.substring(offset + 3, offset + 3 + len);
                return new String[]{val, String.valueOf(3 + len)};
            }
            case FIXED:
            default: {
                String val = message.substring(offset, offset + maxLength);
                // Trim padding
                if (dataType == DataType.NUMERIC) {
                    val = val.replaceFirst("^0+", "");
                    if (val.isEmpty()) val = "0";
                } else {
                    val = val.trim();
                }
                return new String[]{val, String.valueOf(maxLength)};
            }
        }
    }

    private String padOrTruncate(String value) {
        if (value.length() > maxLength) {
            return value.substring(0, maxLength);
        }
        if (dataType == DataType.NUMERIC) {
            // Right-justify, pad with zeros
            return String.format("%" + maxLength + "s", value).replace(' ', '0');
        } else {
            // Left-justify, pad with spaces
            return String.format("%-" + maxLength + "s", value);
        }
    }
}
