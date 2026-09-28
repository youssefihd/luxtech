package com.payment.adapter;

import java.util.Map;
import java.util.TreeMap;

/**
 * Represents a parsed or to-be-built ISO 8583 message.
 *
 * Holds the MTI and a map of field number → value pairs.
 * The bitmap is computed automatically from which fields are present.
 */
public class Iso8583Message {

    private String mti;
    private final TreeMap<Integer, String> fields = new TreeMap<>();

    public Iso8583Message() {}

    public Iso8583Message(String mti) {
        this.mti = mti;
    }

    // -- MTI --

    public String getMti() { return mti; }
    public void setMti(String mti) { this.mti = mti; }

    // -- Fields --

    public void setField(int fieldNumber, String value) {
        if (fieldNumber < 2 || fieldNumber > 128) {
            throw new IllegalArgumentException("Field number must be 2-128, got: " + fieldNumber);
        }
        fields.put(fieldNumber, value);
    }

    public String getField(int fieldNumber) {
        return fields.get(fieldNumber);
    }

    public boolean hasField(int fieldNumber) {
        return fields.containsKey(fieldNumber);
    }

    public Map<Integer, String> getFields() {
        return fields;
    }

    // -- Bitmap --

    /**
     * Compute the 64-bit primary bitmap from present fields.
     * Bit 1 (MSB) is set if any field > 64 is present (secondary bitmap).
     */
    public long computePrimaryBitmap() {
        long bitmap = 0L;
        boolean hasSecondary = fields.keySet().stream().anyMatch(f -> f > 64);
        if (hasSecondary) {
            bitmap |= (1L << 63); // Bit 1 = MSB
        }
        for (int field : fields.keySet()) {
            if (field >= 2 && field <= 64) {
                bitmap |= (1L << (64 - field));
            }
        }
        return bitmap;
    }

    /**
     * Compute the 64-bit secondary bitmap (fields 65-128).
     */
    public long computeSecondaryBitmap() {
        long bitmap = 0L;
        for (int field : fields.keySet()) {
            if (field >= 65 && field <= 128) {
                bitmap |= (1L << (128 - field));
            }
        }
        return bitmap;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("ISO8583 Message [MTI=").append(mti).append("]\n");
        for (Map.Entry<Integer, String> entry : fields.entrySet()) {
            String fieldName = Iso8583FieldRegistry.hasField(entry.getKey())
                    ? Iso8583FieldRegistry.getField(entry.getKey()).getName()
                    : "Unknown";
            sb.append(String.format("  DE%-3d [%-30s] = %s%n",
                    entry.getKey(), fieldName, entry.getValue()));
        }
        return sb.toString();
    }
}
