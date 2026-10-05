package com.b7g2_08.blooddonationsystem.Config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

// Safety net: turns raw DB constraint failures (e.g. a duplicate username slipping past
// the service-layer check in a race) into a clean 409 instead of a 500 with a stack trace.
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("status", 409, "error", "Conflict", "message", "This record conflicts with an existing one (e.g. a duplicate value)."));
    }

    // Without this, a failed @Valid body answers with "Validation failed for object='xDTO'.
    // Error count: 1", which tells the caller nothing about what to fix. The messages written on
    // the DTO annotations are put in "message" instead, where the frontend already reads them.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = new ArrayList<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.add(describe(error.getField(), error.getDefaultMessage()));
        }
        // Class-level rules (e.g. "endDate must not be before startDate") belong to no one field.
        for (ObjectError error : ex.getBindingResult().getGlobalErrors()) {
            errors.add(error.getDefaultMessage());
        }
        if (errors.isEmpty()) {
            errors.add("The request was not valid.");
        }

        return ResponseEntity.badRequest()
                .body(Map.of("status", 400, "error", "Bad Request", "message", String.join(" ", errors), "errors", errors));
    }

    // A message that already names a field reads badly with the field repeated in front of it, and
    // for @AssertTrue rules the "field" is the checker method ("dateRangeValid"), which means
    // nothing to the caller. So the field is only prefixed onto messages that name nothing
    // themselves - the generic built-in ones such as "size must be between 0 and 255".
    private String describe(String field, String message) {
        if (message == null || message.isBlank()) {
            return field + " is not valid.";
        }
        String sentence = message.endsWith(".") ? message : message + ".";
        boolean namesAField = message.toLowerCase().contains(field.toLowerCase()) || NAMES_A_FIELD.matcher(message).find();
        return namesAField ? sentence : field + ": " + sentence;
    }

    /** A camelCase word in the message, e.g. the "endDate" in "endDate must not be before startDate". */
    private static final Pattern NAMES_A_FIELD = Pattern.compile("\\b[a-z]+[A-Z][A-Za-z]*\\b");
}
