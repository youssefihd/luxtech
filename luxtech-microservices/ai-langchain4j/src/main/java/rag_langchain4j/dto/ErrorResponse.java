package rag_langchain4j.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;


// ChatResponse.java


// ErrorResponse.java
public record ErrorResponse(
        int status,
        String error,
        String message,
        Instant timestamp
) {
    public static ErrorResponse of(int status, String error, String msg) {
        return new ErrorResponse(status, error, msg, Instant.now());
    }
}
