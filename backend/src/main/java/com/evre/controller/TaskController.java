package com.evre.controller;

import com.evre.dto.TaskDto;
import com.evre.model.TaskStatus;
import com.evre.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Görev (Task) yönetimi işlemleri (Task endpoints)")
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Yeni Görev Oluştur", description = "Sisteme (ve seçili projeye) yeni bir görev ekler.")
    @PostMapping
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskDto taskDto) {
        return ResponseEntity.ok(taskService.createTask(taskDto));
    }

    @Operation(summary = "Görev Detayı Getir", description = "Verilen ID'ye sahip görevin detaylarını getirir.")
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @Operation(summary = "Tüm Görevleri Getir", description = "Sistemdeki tüm görevleri listeler.")
    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @Operation(summary = "Projenin Görevlerini Getir", description = "Belirtilen projeye (panoya) ait görevleri listeler.")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskDto>> getTasksByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProjectId(projectId));
    }

    @Operation(summary = "Görevi Güncelle", description = "Verilen ID'ye sahip görevi günceller (başlık, açıklama, atanan kişi vb.).")
    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @RequestBody TaskDto taskDto) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDto));
    }

    @Operation(summary = "Görevi Sil", description = "Verilen ID'ye sahip görevi sistemden siler.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Görev Durumunu Güncelle", description = "Verilen ID'ye sahip görevin durumunu (TODO, IN_PROGRESS, DONE) günceller.")
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(@PathVariable Long id, @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
    }
}
