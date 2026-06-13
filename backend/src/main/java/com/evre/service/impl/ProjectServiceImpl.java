package com.evre.service.impl;

import com.evre.dto.ProjectDto;
import com.evre.model.Project;
import com.evre.model.User;
import com.evre.repository.ProjectRepository;
import com.evre.repository.UserRepository;
import com.evre.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    public ProjectDto createProject(ProjectDto projectDto) {
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
        Project savedProject = projectRepository.save(project);
        return mapToDto(savedProject);
    }

    @Override
    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        return mapToDto(project);
    }

    @Override
    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectDto> getProjectsByUserId(Long userId) {
        return projectRepository.findByOwnerId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectDto updateProject(Long id, ProjectDto projectDto) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (projectDto.getOwnerId() != null) {
            User owner = userRepository.findById(projectDto.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            project.setOwner(owner);
        }

        project.setName(projectDto.getName());
        project.setDescription(projectDto.getDescription());
        Project updatedProject = projectRepository.save(project);
        return mapToDto(updatedProject);
    }

    @Override
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    private ProjectDto mapToDto(Project project) {
        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .ownerId(project.getOwner() != null ? project.getOwner().getId() : null)
                .build();
    }
}
