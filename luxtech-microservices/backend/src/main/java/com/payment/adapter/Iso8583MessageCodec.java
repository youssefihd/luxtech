package com.payment.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * Encodes and decodes ISO 8583:1987 messages to/from ASCII string representation.
 *
 * Message format on the wire:
 *   [2-byte length header][4-byte MTI][16-byte bitmap hex][encoded fields...]
 *
 * This implementation uses ASCII encoding for simplicity (production systems
 * typically use BCD for numeric fields and binary bitmaps).
 */
public class Iso8583MessageCodec {

    private static final Logger log = LoggerFactory.getLogger(Iso8583MessageCodec.class);

    /**
     * Encode an Iso8583Message into a raw string (without the length header).
     * The length header is added by the TCP client.
     */
    public String encode(Iso8583Message message) {
        StringBuilder sb = new StringBuilder();

        // 1. MTI (4 characters)
        sb.append(message.getMti());

        // 2. Primary bitmap (16 hex characters = 64 bits)
        long primaryBitmap = message.computePrimaryBitmap();
        sb.append(String.format("%016X", primaryBitmap));

        // 3. Secondary bitmap if needed
        boolean hasSecondary = message.getFields().keySet().stream().anyMatch(f -> f > 64);
        if (hasSecondary) {
            long secondaryBitmap = message.computeSecondaryBitmap();
            sb.append(String.format("%016X", secondaryBitmap));
        }

        // 4. Data elements in field-number order
        for (Map.Entry<Integer, String> entry : message.getFields().entrySet()) {
            int fieldNum = entry.getKey();
            String value = entry.getValue();

            Iso8583FieldDefinition fieldDef = Iso8583FieldRegistry.getField(fieldNum);
            String encoded = fieldDef.encode(value);
            sb.append(encoded);

            log.debug("Encoded DE{}: '{}' → '{}'", fieldNum, value, encoded);
        }

        String result = sb.toString();
        log.info("Encoded ISO 8583 message: MTI={}, fields={}, length={}",
                message.getMti(), message.getFields().size(), result.length());

        return result;
    }

    /**
     * Decode a raw string (without the length header) into an Iso8583Message.
     */
    public Iso8583Message decode(String raw) {
        Iso8583Message message = new Iso8583Message();
        int offset = 0;

        // 1. MTI (4 characters)
        String mti = raw.substring(offset, offset + 4);
        message.setMti(mti);
        offset += 4;

        // 2. Primary bitmap (16 hex characters)
        String primaryBitmapHex = raw.substring(offset, offset + 16);
        long primaryBitmap = parseHexBitmap(primaryBitmapHex);
        offset += 16;

        // 3. Check for secondary bitmap (bit 1 of primary)
        boolean hasSecondary = (primaryBitmap & (1L << 63)) != 0;
        long secondaryBitmap = 0L;
        if (hasSecondary) {
            String secondaryBitmapHex = raw.substring(offset, offset + 16);
            secondaryBitmap = parseHexBitmap(secondaryBitmapHex);
            offset += 16;
        }

        // 4. Parse data elements based on bitmap
        // Primary bitmap: fields 2-64
        for (int field = 2; field <= 64; field++) {
            if ((primaryBitmap & (1L << (64 - field))) != 0) {
                offset = decodeField(raw, offset, field, message);
            }
        }

        // Secondary bitmap: fields 65-128
        if (hasSecondary) {
            for (int field = 65; field <= 128; field++) {
                if ((secondaryBitmap & (1L << (128 - field))) != 0) {
                    offset = decodeField(raw, offset, field, message);
                }
            }
        }

        log.info("Decoded ISO 8583 message: MTI={}, fields={}", mti, message.getFields().size());
        return message;
    }

    private int decodeField(String raw, int offset, int fieldNumber, Iso8583Message message) {
        if (!Iso8583FieldRegistry.hasField(fieldNumber)) {
            log.warn("Skipping unknown field DE{}", fieldNumber);
            return offset;
        }

        Iso8583FieldDefinition fieldDef = Iso8583FieldRegistry.getField(fieldNumber);
        String[] result = fieldDef.decode(raw, offset);
        String value = result[0];
        int consumed = Integer.parseInt(result[1]);

        message.setField(fieldNumber, value);
        log.debug("Decoded DE{}: '{}'", fieldNumber, value);

        return offset + consumed;
    }

    private long parseHexBitmap(String hex) {
        // Parse as unsigned — Java's Long.parseUnsignedLong handles values > Long.MAX_VALUE
        return Long.parseUnsignedLong(hex, 16);
    }
}
