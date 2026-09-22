package com.luxtech.booking.exception;
import com.luxtech.booking.dto.BookingDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;
@RestControllerAdvice @Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(BookingException.class)
    public ResponseEntity<BookingDto.ApiResponse<Void>> handle(BookingException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(BookingDto.ApiResponse.error(ex.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BookingDto.ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream().map(f -> f.getDefaultMessage()).collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(BookingDto.ApiResponse.error("Validation : " + errors));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BookingDto.ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Erreur", ex);
        return ResponseEntity.status(500).body(BookingDto.ApiResponse.error("Erreur interne."));
    }
}
