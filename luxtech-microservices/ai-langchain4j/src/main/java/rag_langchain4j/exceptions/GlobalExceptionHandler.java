package rag_langchain4j.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import rag_langchain4j.dto.ErrorResponse;

import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {


    @ExceptionHandler(WebExchangeBindException.class)
    public ResponseEntity<ErrorResponse> handleValidation(WebExchangeBindException ex) {
        String msg = ex.getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of(400, "Validation Failed", msg));
    }

    @ExceptionHandler(OrchestratorException.class)
    public ResponseEntity<ErrorResponse> handleOrchestrator(OrchestratorException ex) {
        log.error("Orchestrator error: {}", ex.getMessage());
        return ResponseEntity.status(502)
                .body(ErrorResponse.of(502, "Bad Gateway", "AI service temporarily unavailable"));
    }

    @ExceptionHandler(TimeoutException.class)
    public ResponseEntity<ErrorResponse> handleTimeout(TimeoutException ex) {
        return ResponseEntity.status(504)
                .body(ErrorResponse.of(504, "Gateway Timeout", "Request took too long"));
    }
}