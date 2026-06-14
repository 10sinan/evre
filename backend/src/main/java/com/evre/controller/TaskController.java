package com.evre.controller;

import com.evre.dto.TaskDto;
import com.evre.model.Task;
import com.evre.model.TaskStatus;
import com.evre.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tasks", description = "Görev (Task) yönetimi işlemleri (Task endpoints)")
public class TaskController extends BaseController<Task, TaskDto, Long> {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        super(taskService);
        this.taskService = taskService;
    }

    @Override
    @Operation(summary = "Yeni Görev Oluştur", description = "Sisteme (ve seçili projeye) yeni bir görev ekler.")
    @PostMapping
    public ResponseEntity<TaskDto> create(@RequestBody TaskDto taskDto) {
        return super.create(taskDto);
    }

    @Override
    @Operation(summary = "Görev Detayı Getir", description = "Verilen ID'ye sahip görevin detaylarını getirir.")
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getById(@PathVariable Long id) {
        return super.getById(id);
    }

    @Override
    @Operation(summary = "Tüm Görevleri Getir", description = "Sistemdeki tüm görevleri listeler.")
    @GetMapping
    public ResponseEntity<List<TaskDto>> getAll() {
        return super.getAll();
    }

    @Override
    @Operation(summary = "Görevi Güncelle", description = "Verilen ID'ye sahip görevi günceller (başlık, açıklama, atanan kişi vb.).")
    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> update(@PathVariable Long id, @RequestBody TaskDto taskDto) {
        return super.update(id, taskDto);
    }

    @Override
    @Operation(summary = "Görevi Sil", description = "Verilen ID'ye sahip görevi sistemden siler.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return super.delete(id);
    }

    // --- Custom Endpoints ---

    @Operation(summary = "Projenin Görevlerini Getir", description = "Belirtilen projeye (panoya) ait görevleri listeler.")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskDto>> getTasksByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProjectId(projectId));
    }

    @Operation(summary = "Görev Durumunu Güncelle", description = "Verilen ID'ye sahip görevin durumunu (TODO, IN_PROGRESS, DONE) günceller.")
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(@PathVariable Long id, @RequestParam TaskStatus status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
    }
}
