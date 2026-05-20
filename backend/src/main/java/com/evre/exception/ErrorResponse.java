package com.evre.exception;

public record ErrorResponse(long timestamp, int status, String error, String message, String path, Object details) {
}
