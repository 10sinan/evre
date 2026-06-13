package com.evre.controller;

import com.evre.dto.TerminalRequest;
import com.evre.service.TerminalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/terminal")
@RequiredArgsConstructor
@Tag(name = "Terminal", description = "Canlı Terminal / CLI Motoru endpointleri")
public class TerminalController {

    private final TerminalService terminalService;

    @Operation(summary = "Terminal Komutunu Çalıştır", description = "Metin tabanlı CLI komutlarını yorumlar, veritabanını günceller ve arayüzü canlı tetikler.")
    @PostMapping("/execute")
    public ResponseEntity<String> executeCommand(@RequestBody TerminalRequest request) {
        String output = terminalService.executeCommand(request);
        return ResponseEntity.ok(output);
    }
}
