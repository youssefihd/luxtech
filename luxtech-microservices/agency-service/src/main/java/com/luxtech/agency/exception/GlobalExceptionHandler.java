package com.luxtech.agency.exception;
import com.luxtech.agency.dto.AgenceDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;
@RestControllerAdvice @Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(AgenceException.class)
    public ResponseEntity<AgenceDto.ApiResponse<Void>> handle(AgenceException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(AgenceDto.ApiResponse.error(ex.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<AgenceDto.ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream().map(f -> f.getDefaultMessage()).collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(AgenceDto.ApiResponse.error("Validation : " + errors));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<AgenceDto.ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Erreur", ex); return ResponseEntity.status(500).body(AgenceDto.ApiResponse.error("Erreur interne."));
    }
}
