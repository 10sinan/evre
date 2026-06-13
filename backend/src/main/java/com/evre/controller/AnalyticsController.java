package com.evre.controller;

import com.evre.dto.AnalyticsSummaryDto;
import com.evre.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Proje istatistikleri ve analitik verileri (Analytics endpoints)")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(
        summary = "Proje İstatistiklerini Getir",
        description = "Belirtilen projenin toplam görev sayısını, durum bazlı dağılımını (TODO/IN_PROGRESS/DONE) ve kullanıcı bazlı görev yükünü döndürür."
    )
    @GetMapping("/project/{projectId}")
    public ResponseEntity<AnalyticsSummaryDto> getProjectAnalytics(@PathVariable Long projectId) {
        return ResponseEntity.ok(analyticsService.getProjectSummary(projectId));
    }
}
