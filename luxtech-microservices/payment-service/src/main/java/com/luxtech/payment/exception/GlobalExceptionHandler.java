package com.luxtech.payment.exception;
import com.luxtech.payment.dto.PaymentDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;
@RestControllerAdvice @Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<PaymentDto.ApiResponse<Void>> handle(PaymentException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(PaymentDto.ApiResponse.error(ex.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<PaymentDto.ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream().map(f -> f.getDefaultMessage()).collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(PaymentDto.ApiResponse.error("Validation : " + errors));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<PaymentDto.ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Erreur", ex);
        return ResponseEntity.status(500).body(PaymentDto.ApiResponse.error("Erreur interne."));
    }
}
