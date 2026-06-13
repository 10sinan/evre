package com.evre.controller;

import com.evre.dto.CommentDto;
import com.evre.dto.TaskDto;
import com.evre.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Görev yorumları (Comment) yönetimi işlemleri")
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "Göreve Yorum Ekle", description = "Belirtilen ID'ye sahip görevin altına yeni bir kullanıcı yorumu ekler.")
    @PostMapping("/tasks/{taskId}/comments")
    public ResponseEntity<TaskDto> addComment(@PathVariable Long taskId, @RequestBody CommentDto commentDto) {
        return ResponseEntity.ok(commentService.addComment(taskId, commentDto));
    }
}
