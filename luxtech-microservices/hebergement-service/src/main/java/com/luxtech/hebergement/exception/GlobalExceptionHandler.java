package com.luxtech.hebergement.exception;
import com.luxtech.hebergement.dto.HebergementDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

@RestControllerAdvice @Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(HebergementException.class)
    public ResponseEntity<HebergementDto.ApiResponse<Void>> handle(HebergementException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(HebergementDto.ApiResponse.error(ex.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<HebergementDto.ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getDefaultMessage()).collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(HebergementDto.ApiResponse.error("Validation : " + errors));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<HebergementDto.ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Erreur", ex);
        return ResponseEntity.status(500).body(HebergementDto.ApiResponse.error("Erreur interne."));
    }
}