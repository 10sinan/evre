package com.evre.controller;

import com.evre.dto.ProjectDto;
import com.evre.model.Project;
import com.evre.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Proje/Pano yönetimi işlemleri (Project endpoints)")
public class ProjectController extends BaseController<Project, ProjectDto, Long> {

    private final ProjectService projectService;

    @Autowired
    public ProjectController(ProjectService projectService) {
        super(projectService);
        this.projectService = projectService;
    }

    @Override
    @Operation(summary = "Yeni Proje Oluştur", description = "Sisteme yeni bir proje (pano) ekler.")
    @PostMapping
    public ResponseEntity<ProjectDto> create(@RequestBody ProjectDto projectDto) {
        return super.create(projectDto);
    }

    @Override
    @Operation(summary = "Proje Detayı Getir", description = "Verilen ID'ye sahip projenin detaylarını getirir.")
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getById(@PathVariable Long id) {
        return super.getById(id);
    }

    @Override
    @Operation(summary = "Tüm Projeleri Getir", description = "Sistemdeki tüm projeleri listeler.")
    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAll() {
        return super.getAll();
    }

    @Override
    @Operation(summary = "Projeyi Güncelle", description = "Verilen ID'ye sahip projeyi günceller.")
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> update(@PathVariable Long id, @RequestBody ProjectDto projectDto) {
        return super.update(id, projectDto);
    }

    @Override
    @Operation(summary = "Projeyi Sil", description = "Verilen ID'ye sahip projeyi sistemden siler.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return super.delete(id);
    }

    // --- Custom Endpoints ---

    @Operation(summary = "Kullanıcının Projelerini Getir", description = "Belirtilen kullanıcının sahip olduğu projeleri listeler.")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectDto>> getProjectsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(projectService.getProjectsByUserId(userId));
    }
}
