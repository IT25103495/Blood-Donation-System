package com.b7g2_08.blooddonationsystem.Config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

// Safety net: turns raw DB constraint failures (e.g. a duplicate username slipping past
// the service-layer check in a race) into a clean 409 instead of a 500 with a stack trace.
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("status", 409, "error", "Conflict", "message", "This record conflicts with an existing one (e.g. a duplicate value)."));
    }
}
