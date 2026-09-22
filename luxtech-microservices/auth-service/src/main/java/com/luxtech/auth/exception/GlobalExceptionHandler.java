package com.luxtech.auth.exception;
import com.luxtech.auth.dto.AuthDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

@RestControllerAdvice @Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(AuthException.class)
    public ResponseEntity<AuthDto.ApiResponse<Void>> handleAuth(AuthException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(AuthDto.ApiResponse.error(ex.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<AuthDto.ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream().map(FieldError::getDefaultMessage).collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(AuthDto.ApiResponse.error("Validation : " + errors));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<AuthDto.ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("Erreur inattendue", ex);
        return ResponseEntity.status(500).body(AuthDto.ApiResponse.error("Erreur interne du serveur."));
    }
}
