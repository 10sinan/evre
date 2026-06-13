package com.evre.service;

import com.evre.dto.ProjectDto;
import java.util.List;

public interface ProjectService {
    ProjectDto createProject(ProjectDto projectDto);
    ProjectDto getProjectById(Long id);
    List<ProjectDto> getAllProjects();
    ProjectDto updateProject(Long id, ProjectDto projectDto);
    void deleteProject(Long id);
}
