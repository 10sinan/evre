package com.evre.service;

import com.evre.dto.ProjectDto;
import com.evre.model.Project;
import java.util.List;

public interface ProjectService extends BaseService<Project, ProjectDto, Long> {
    ProjectDto createProject(ProjectDto projectDto);
    ProjectDto getProjectById(Long id);
    List<ProjectDto> getAllProjects();
    List<ProjectDto> getProjectsByUserId(Long userId);
    ProjectDto updateProject(Long id, ProjectDto projectDto);
    void deleteProject(Long id);
}
