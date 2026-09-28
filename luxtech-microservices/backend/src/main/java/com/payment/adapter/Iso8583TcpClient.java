package com.payment.adapter;

import com.payment.exception.ProcessorConnectionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

/**
 * TCP client for communicating with the payment processor.
 *
 * Uses a 2-byte big-endian length header protocol:
 *   [2 bytes: message length][N bytes: ISO 8583 message]
 *
 * This is the standard framing used in ISO 8583 over TCP/IP.
 * The length header tells the receiver how many bytes to read
 * for the complete message.
 */
public class Iso8583TcpClient {

    private static final Logger log = LoggerFactory.getLogger(Iso8583TcpClient.class);

    private final String host;
    private final int port;
    private final int connectTimeoutMs;
    private final int readTimeoutMs;

    public Iso8583TcpClient(String host, int port, int connectTimeoutMs, int readTimeoutMs) {
        this.host = host;
        this.port = port;
        this.connectTimeoutMs = connectTimeoutMs;
        this.readTimeoutMs = readTimeoutMs;
    }

    /**
     * Send an ISO 8583 message and wait for the response.
     *
     * @param messageBody The encoded ISO 8583 message (MTI + bitmap + fields)
     * @return The response message body (without length header)
     */
    public String sendAndReceive(String messageBody) {
        log.info("Connecting to processor at {}:{}", host, port);

        try (Socket socket = new Socket()) {
            // Connect with timeout
            socket.connect(new InetSocketAddress(host, port), connectTimeoutMs);
            socket.setSoTimeout(readTimeoutMs);

            log.info("Connected. Sending {} bytes", messageBody.length());

            OutputStream out = socket.getOutputStream();
            InputStream in = socket.getInputStream();

            // Send: [2-byte length][message]
            byte[] messageBytes = messageBody.getBytes(StandardCharsets.US_ASCII);
            int length = messageBytes.length;

            // Write 2-byte big-endian length header
            out.write((length >> 8) & 0xFF);
            out.write(length & 0xFF);
            out.write(messageBytes);
            out.flush();

            log.info("Message sent. Waiting for response...");

            // Receive: [2-byte length][response]
            int highByte = in.read();
            int lowByte = in.read();
            if (highByte == -1 || lowByte == -1) {
                throw new ProcessorConnectionException("Connection closed by processor before response");
            }
            int responseLength = (highByte << 8) | lowByte;

            log.info("Response length header: {} bytes", responseLength);

            byte[] responseBytes = new byte[responseLength];
            int totalRead = 0;
            while (totalRead < responseLength) {
                int read = in.read(responseBytes, totalRead, responseLength - totalRead);
                if (read == -1) {
                    throw new ProcessorConnectionException(
                            "Connection closed mid-response (read " + totalRead + "/" + responseLength + " bytes)");
                }
                totalRead += read;
            }

            String response = new String(responseBytes, StandardCharsets.US_ASCII);
            log.info("Received response: {} bytes", response.length());

            return response;

        } catch (IOException e) {
            log.error("TCP communication error with processor: {}", e.getMessage());
            throw new ProcessorConnectionException("Failed to communicate with processor at "
                    + host + ":" + port + " — " + e.getMessage(), e);
        }
    }
}
