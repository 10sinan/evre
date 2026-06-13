package com.evre.controller;

import com.evre.dto.ActivityLogDto;
import com.evre.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@Tag(name = "Activity Logs", description = "Proje aktivite logları işlemleri (Activity Log endpoints)")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @Operation(summary = "Projenin Loglarını Getir", description = "Belirtilen projeye ait tüm geçmiş logları en yeniden en eskiye doğru listeler.")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ActivityLogDto>> getLogsByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(activityLogService.getLogsByProjectId(projectId));
    }
}
