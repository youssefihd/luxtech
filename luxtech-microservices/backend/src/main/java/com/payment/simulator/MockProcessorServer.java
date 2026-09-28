package com.payment.simulator;

import com.payment.adapter.Iso8583Message;
import com.payment.adapter.Iso8583MessageCodec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Standalone mock payment processor server for testing.
 *
 * Simulates a real card processor by:
 *   1. Listening on a TCP port for ISO 8583 messages
 *   2. Parsing the request
 *   3. Applying simple approval/decline logic
 *   4. Building and sending an ISO 8583 response
 *
 * Approval logic (for testing):
 *   - PAN ending in "0000" → Declined (insufficient funds)
 *   - PAN ending in "9999" → Declined (expired card)
 *   - Amount > 100,000.00 → Declined (exceeds limit)
 *   - Everything else → Approved
 *
 * Run this as a standalone Java application before starting the gateway.
 */
public class MockProcessorServer {

    private static final Logger log = LoggerFactory.getLogger(MockProcessorServer.class);

    private final int port;
    private final Iso8583MessageCodec codec = new Iso8583MessageCodec();
    private final Random random = new Random();
    private volatile boolean running = true;

    public MockProcessorServer(int port) {
        this.port = port;
    }

    public void start() {
        ExecutorService executor = Executors.newCachedThreadPool();

        try (ServerSocket serverSocket = new ServerSocket(port)) {
            log.info("╔═══════════════════════════════════════════════════╗");
            log.info("║  Mock Payment Processor Server                   ║");
            log.info("║  Listening on port {}                           ║", port);
            log.info("║  Ready to accept ISO 8583 messages               ║");
            log.info("╚═══════════════════════════════════════════════════╝");

            while (running) {
                Socket clientSocket = serverSocket.accept();
                log.info("New connection from {}", clientSocket.getRemoteSocketAddress());
                executor.submit(() -> handleClient(clientSocket));
            }
        } catch (IOException e) {
            log.error("Server error: {}", e.getMessage());
        } finally {
            executor.shutdown();
        }
    }

    private void handleClient(Socket clientSocket) {
        try (clientSocket) {
            InputStream in = clientSocket.getInputStream();
            OutputStream out = clientSocket.getOutputStream();

            // Read 2-byte length header
            int highByte = in.read();
            int lowByte = in.read();
            if (highByte == -1 || lowByte == -1) {
                log.warn("Connection closed before message received");
                return;
            }
            int messageLength = (highByte << 8) | lowByte;

            // Read message body
            byte[] messageBytes = new byte[messageLength];
            int totalRead = 0;
            while (totalRead < messageLength) {
                int read = in.read(messageBytes, totalRead, messageLength - totalRead);
                if (read == -1) break;
                totalRead += read;
            }

            String rawRequest = new String(messageBytes, StandardCharsets.US_ASCII);
            log.info("Received {} bytes", rawRequest.length());

            // Parse the ISO 8583 request
            Iso8583Message request = codec.decode(rawRequest);
            log.info("Request:\n{}", request);

            // Process and build response
            Iso8583Message response = processRequest(request);
            log.info("Response:\n{}", response);

            // Encode and send response
            String rawResponse = codec.encode(response);
            byte[] responseBytes = rawResponse.getBytes(StandardCharsets.US_ASCII);

            // Write 2-byte length header + response
            out.write((responseBytes.length >> 8) & 0xFF);
            out.write(responseBytes.length & 0xFF);
            out.write(responseBytes);
            out.flush();

            log.info("Response sent: {} bytes", responseBytes.length);

        } catch (Exception e) {
            log.error("Error handling client: {}", e.getMessage(), e);
        }
    }

    /**
     * Apply mock approval/decline logic and build the response message.
     */
    private Iso8583Message processRequest(Iso8583Message request) {
        Iso8583Message response = new Iso8583Message();

        // Set response MTI (request MTI + 10)
        int requestMti = Integer.parseInt(request.getMti());
        response.setMti(String.format("%04d", requestMti + 10));

        // Echo back key fields
        echoField(request, response, 2);   // PAN
        echoField(request, response, 3);   // Processing Code
        echoField(request, response, 4);   // Amount
        echoField(request, response, 11);  // STAN
        echoField(request, response, 12);  // Local Time
        echoField(request, response, 13);  // Local Date
        echoField(request, response, 37);  // RRN
        echoField(request, response, 41);  // Terminal ID
        echoField(request, response, 42);  // Merchant ID
        echoField(request, response, 49);  // Currency Code

        // Apply approval logic
        String pan = request.getField(2);
        String amountStr = request.getField(4);
        long amount = amountStr != null ? Long.parseLong(amountStr) : 0;

        String responseCode;
        String authCode = null;

        if (pan != null && pan.endsWith("0000")) {
            responseCode = "51"; // Insufficient funds
            log.info("→ DECLINED: PAN ends in 0000 (simulated insufficient funds)");
        } else if (pan != null && pan.endsWith("9999")) {
            responseCode = "54"; // Expired card
            log.info("→ DECLINED: PAN ends in 9999 (simulated expired card)");
        } else if (pan != null && pan.endsWith("4343")) {
            responseCode = "43"; // Stolen card
            log.info("→ DECLINED: PAN ends in 4343 (simulated stolen card)");
        } else if (amount > 10000000) { // > 100,000.00
            responseCode = "61"; // Exceeds limit
            log.info("→ DECLINED: Amount {} exceeds limit", amount);
        } else {
            responseCode = "00"; // Approved
            authCode = generateAuthCode();
            log.info("→ APPROVED: authCode={}", authCode);
        }

        // DE39 — Response Code
        response.setField(39, responseCode);

        // DE38 — Authorization Code (only if approved)
        if (authCode != null) {
            response.setField(38, authCode);
        }

        return response;
    }

    private void echoField(Iso8583Message request, Iso8583Message response, int field) {
        if (request.hasField(field)) {
            response.setField(field, request.getField(field));
        }
    }

    private String generateAuthCode() {
        return String.format("A%05d", random.nextInt(100000));
    }

    // ── Entry point ────────────────────────────────────────────

    public static void main(String[] args) {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : 9876;
        new MockProcessorServer(port).start();
    }
}
