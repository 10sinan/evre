package com.evre.service.impl;

import com.evre.dto.ProjectDto;
import com.evre.model.Project;
import com.evre.model.User;
import com.evre.repository.ProjectRepository;
import com.evre.repository.UserRepository;
import com.evre.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl extends BaseServiceImpl<Project, ProjectDto, Long, ProjectRepository> implements ProjectService {

    private final UserRepository userRepository;

    @Autowired
    public ProjectServiceImpl(ProjectRepository projectRepository, UserRepository userRepository) {
        super(projectRepository);
        this.userRepository = userRepository;
    }

    @Override
    protected ProjectDto mapToDto(Project project) {
        if (project == null) return null;
        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .ownerId(project.getOwner() != null ? project.getOwner().getId() : null)
                .build();
    }

    @Override
    protected Project mapToEntity(ProjectDto projectDto) {
        if (projectDto == null) return null;
        User owner = null;
        if (projectDto.getOwnerId() != null) {
            owner = userRepository.findById(projectDto.getOwnerId()).orElse(null);
        }
        return Project.builder()
                .id(projectDto.getId())
                .name(projectDto.getName())
                .description(projectDto.getDescription())
                .owner(owner)
                .build();
    }

    @Override
    public ProjectDto save(ProjectDto projectDto) {
        User owner = null;
        if (projectDto.getOwnerId() != null) {
            owner = userRepository.findById(projectDto.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
        }

        Project project = Project.builder()
                .name(projectDto.getName())
                .description(projectDto.getDescription())
                .owner(owner)
                .build();
        Project savedProject = repository.save(project);
        return mapToDto(savedProject);
    }

    @Override
    public ProjectDto findById(Long id) {
        Project project = repository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        return mapToDto(project);
    }

    @Override
    public List<ProjectDto> findAll() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Project not found");
        }
        repository.deleteById(id);
    }

    @Override
    public ProjectDto update(Long id, ProjectDto projectDto) {
        Project project = repository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (projectDto.getOwnerId() != null) {
            User owner = userRepository.findById(projectDto.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            project.setOwner(owner);
        }

        project.setName(projectDto.getName());
        project.setDescription(projectDto.getDescription());
        Project updatedProject = repository.save(project);
        return mapToDto(updatedProject);
    }

    // --- Legacy / ProjectService specific methods ---

    @Override
    public ProjectDto createProject(ProjectDto projectDto) {
        return save(projectDto);
    }

    @Override
    public ProjectDto getProjectById(Long id) {
        return findById(id);
    }

    @Override
    public List<ProjectDto> getAllProjects() {
        return findAll();
    }

    @Override
    public List<ProjectDto> getProjectsByUserId(Long userId) {
        return repository.findByOwnerId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectDto updateProject(Long id, ProjectDto projectDto) {
        return update(id, projectDto);
    }

    @Override
    public void deleteProject(Long id) {
        deleteById(id);
    }
}
