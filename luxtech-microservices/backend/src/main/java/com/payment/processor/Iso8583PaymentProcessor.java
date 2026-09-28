package com.payment.processor;

import com.payment.adapter.Iso8583Adapter;
import com.payment.adapter.Iso8583Message;
import com.payment.enums.ResponseCode;
import com.payment.enums.TransactionType;
import com.payment.exception.PaymentProcessingException;
import com.payment.model.PaymentRequest;
import com.payment.model.PaymentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * ISO 8583 implementation of PaymentProcessor.
 *
 * Responsible for:
 * 1. Mapping domain PaymentRequest → ISO 8583 data elements
 * 2. Delegating to Iso8583Adapter for encoding/sending/decoding
 * 3. Mapping ISO 8583 response fields → domain PaymentResponse
 */
@Component
public class Iso8583PaymentProcessor implements PaymentProcessor {

    private static final Logger log = LoggerFactory.getLogger(Iso8583PaymentProcessor.class);

    private final Iso8583Adapter adapter;

    public Iso8583PaymentProcessor(Iso8583Adapter adapter) {
        this.adapter = adapter;
    }

    @Override
    public PaymentResponse authorize(PaymentRequest request) {
        request.setTransactionType(TransactionType.AUTHORIZATION);
        return processTransaction(request);
    }

    @Override
    public PaymentResponse purchase(PaymentRequest request) {
        request.setTransactionType(TransactionType.PURCHASE);
        return processTransaction(request);
    }

    @Override
    public PaymentResponse reverse(PaymentRequest request) {
        request.setTransactionType(TransactionType.REVERSAL);
        return processTransaction(request);
    }

    // ──────────────────────────────────────────────────────────

    private PaymentResponse processTransaction(PaymentRequest request) {
        TransactionType txnType = request.getTransactionType();

        log.info("Processing {} for PAN={}, amount={}",
                txnType, request.getMaskedPan(), request.getAmountMinorUnits());

        // Build ISO 8583 message
        Iso8583Message isoMessage = buildIso8583Message(request);

        // Send to processor via adapter
        Iso8583Message isoResponse = adapter.sendMessage(isoMessage);

        // Validate response MTI
        String expectedMti = txnType.getResponseMti();
        if (!expectedMti.equals(isoResponse.getMti())) {
            throw new PaymentProcessingException(
                    "Unexpected response MTI: expected " + expectedMti + ", got " + isoResponse.getMti());
        }

        // Map response
        return mapResponse(isoResponse);
    }

    /**
     * Map domain PaymentRequest → ISO 8583 data elements.
     */
    private Iso8583Message buildIso8583Message(PaymentRequest request) {
        TransactionType txnType = request.getTransactionType();
        Iso8583Message msg = new Iso8583Message(txnType.getMti());

        LocalDateTime now = LocalDateTime.now();

        // DE2  — Primary Account Number
        msg.setField(2, request.getPan());

        // DE3  — Processing Code
        msg.setField(3, txnType.getProcessingCode());

        // DE4  — Transaction Amount (12-digit, minor units)
        msg.setField(4, String.valueOf(request.getAmountMinorUnits()));

        // DE7  — Transmission Date/Time (MMDDhhmmss)
        msg.setField(7, now.format(DateTimeFormatter.ofPattern("MMddHHmmss")));

        // DE11 — System Trace Audit Number
        msg.setField(11, request.getStan());

        // DE12 — Local Transaction Time (hhmmss)
        msg.setField(12, now.format(DateTimeFormatter.ofPattern("HHmmss")));

        // DE13 — Local Transaction Date (MMDD)
        msg.setField(13, now.format(DateTimeFormatter.ofPattern("MMdd")));

        // DE14 — Expiration Date (YYMM)
        if (request.getExpiryDate() != null) {
            msg.setField(14, request.getExpiryDate());
        }

        // DE22 — POS Entry Mode (051 = manual key entry, no PIN)
        msg.setField(22, "051");

        // DE25 — POS Condition Code (00 = normal transaction)
        msg.setField(25, "00");

        // DE37 — Retrieval Reference Number
        if (request.getRetrievalRefNumber() != null) {
            msg.setField(37, request.getRetrievalRefNumber());
        }

        // DE41 — Terminal ID
        msg.setField(41, request.getTerminalId() != null ? request.getTerminalId() : "TERM0001");

        // DE42 — Merchant ID
        msg.setField(42, request.getMerchantId() != null ? request.getMerchantId() : "MERCHANT000001");

        // DE43 — Merchant Name/Location
        msg.setField(43, request.getMerchantName() != null
                ? request.getMerchantName()
                : "PAYMENT GATEWAY         CASABLANCA   MA");

        // DE49 — Currency Code
        msg.setField(49, request.getCurrency().getNumericCode());

        return msg;
    }

    /**
     * Map ISO 8583 response fields → domain PaymentResponse.
     */
    private PaymentResponse mapResponse(Iso8583Message isoResponse) {
        PaymentResponse response = new PaymentResponse();

        // DE39 — Response Code
        String responseCode = isoResponse.getField(39);
        if (responseCode != null) {
            response.setResponseCode(ResponseCode.fromCode(responseCode));
            response.setRawResponseCode(responseCode);
        } else {
            response.setResponseCode(ResponseCode.SYSTEM_MALFUNCTION);
        }

        // DE38 — Authorization Code
        response.setAuthorizationCode(isoResponse.getField(38));

        // DE37 — Retrieval Reference Number
        response.setRetrievalRefNumber(isoResponse.getField(37));

        // DE11 — STAN (echo back)
        response.setStan(isoResponse.getField(11));

        log.info("Transaction result: approved={}, responseCode={} ({})",
                response.isApproved(),
                response.getResponseCode().getCode(),
                response.getResponseCode().getDescription());

        return response;
    }
}
