package com.payment.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * High-level adapter that orchestrates ISO 8583 message lifecycle:
 *   1. Build message (domain fields → ISO 8583 message)
 *   2. Encode to wire format
 *   3. Send over TCP/IP
 *   4. Decode response
 *   5. Return parsed message
 *
 * This is the single entry point used by Iso8583PaymentProcessor.
 */
@Component
public class Iso8583Adapter {

    private static final Logger log = LoggerFactory.getLogger(Iso8583Adapter.class);

    private final Iso8583MessageCodec codec;
    private final Iso8583TcpClient tcpClient;

    public Iso8583Adapter(
            @Value("${processor.host:localhost}") String host,
            @Value("${processor.port:9876}") int port,
            @Value("${processor.connect-timeout:5000}") int connectTimeout,
            @Value("${processor.read-timeout:30000}") int readTimeout) {

        this.codec = new Iso8583MessageCodec();
        this.tcpClient = new Iso8583TcpClient(host, port, connectTimeout, readTimeout);
        log.info("Iso8583Adapter initialized — processor at {}:{}", host, port);
    }

    /**
     * Send an ISO 8583 message to the processor and return the parsed response.
     *
     * @param request The message to send
     * @return The parsed response message
     */
    public Iso8583Message sendMessage(Iso8583Message request) {
        log.info("Sending ISO 8583 message: MTI={}", request.getMti());
        log.debug("Request details:\n{}", request);

        // Encode the message
        String encoded = codec.encode(request);

        // Send over TCP and get response
        String responseRaw = tcpClient.sendAndReceive(encoded);

        // Decode the response
        Iso8583Message response = codec.decode(responseRaw);

        log.info("Received response: MTI={}, DE39={}",
                response.getMti(), response.getField(39));
        log.debug("Response details:\n{}", response);

        return response;
    }

    /**
     * Encode a message without sending (useful for testing/logging).
     */
    public String encodeMessage(Iso8583Message message) {
        return codec.encode(message);
    }

    /**
     * Decode a raw message string (useful for testing/logging).
     */
    public Iso8583Message decodeMessage(String raw) {
        return codec.decode(raw);
    }
}
