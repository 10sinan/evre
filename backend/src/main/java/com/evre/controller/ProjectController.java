package com.evre.controller;

import com.evre.dto.ProjectDto;
import com.evre.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Proje/Pano yönetimi işlemleri (Project endpoints)")
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "Yeni Proje Oluştur", description = "Sisteme yeni bir proje (pano) ekler.")
    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@RequestBody ProjectDto projectDto) {
        return ResponseEntity.ok(projectService.createProject(projectDto));
    }

    @Operation(summary = "Proje Detayı Getir", description = "Verilen ID'ye sahip projenin detaylarını getirir.")
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @Operation(summary = "Tüm Projeleri Getir", description = "Sistemdeki tüm projeleri listeler.")
    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @Operation(summary = "Kullanıcının Projelerini Getir", description = "Belirtilen kullanıcının sahip olduğu projeleri listeler.")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectDto>> getProjectsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(projectService.getProjectsByUserId(userId));
    }

    @Operation(summary = "Projeyi Güncelle", description = "Verilen ID'ye sahip projeyi günceller.")
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @RequestBody ProjectDto projectDto) {
        return ResponseEntity.ok(projectService.updateProject(id, projectDto));
    }

    @Operation(summary = "Projeyi Sil", description = "Verilen ID'ye sahip projeyi sistemden siler.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
