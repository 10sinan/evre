package com.evre.controller;

import com.evre.dto.SubTaskDto;
import com.evre.dto.TaskDto;
import com.evre.service.SubTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "SubTasks", description = "Alt görev (SubTask/Checklist) yönetimi işlemleri")
public class SubTaskController {

    private final SubTaskService subTaskService;

    @Operation(summary = "Göreve Alt Görev Ekle", description = "Belirtilen ID'ye sahip görevin altına yeni bir alt görev ekler.")
    @PostMapping("/tasks/{taskId}/subtasks")
    public ResponseEntity<TaskDto> addSubTask(@PathVariable Long taskId, @RequestBody SubTaskDto subTaskDto) {
        return ResponseEntity.ok(subTaskService.addSubTask(taskId, subTaskDto));
    }

    @Operation(summary = "Alt Görevin Durumunu Değiştir", description = "Alt görevin tamamlanma durumunu (yapıldı/yapılmadı) tersine çevirir.")
    @PutMapping("/subtasks/{subTaskId}/toggle")
    public ResponseEntity<TaskDto> toggleSubTask(@PathVariable Long subTaskId) {
        return ResponseEntity.ok(subTaskService.toggleSubTask(subTaskId));
    }
}
