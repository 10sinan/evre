package com.evre.controller;

import com.evre.dto.AuthRequest;
import com.evre.dto.AuthResponse;
import com.evre.dto.RegisterRequest;
import com.evre.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Kullanıcı kayıt ve giriş işlemleri (Authentication endpoints)")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Kullanıcı Kaydı", description = "Yeni bir kullanıcı hesabı oluşturur ve JWT token döndürür.")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @Operation(summary = "Kullanıcı Girişi", description = "Kullanıcı adı ve şifre ile giriş yapar, JWT token döndürür.")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
