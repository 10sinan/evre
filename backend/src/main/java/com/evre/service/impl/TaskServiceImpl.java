package com.evre.service.impl;

import com.evre.dto.TaskDto;
import com.evre.model.Project;
import com.evre.model.Task;
import com.evre.model.TaskStatus;
import com.evre.model.User;
import com.evre.repository.ProjectRepository;
import com.evre.repository.TaskRepository;
import com.evre.repository.UserRepository;
import com.evre.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    public TaskDto createTask(TaskDto taskDto) {
        Project project = null;
        if (taskDto.getProjectId() != null) {
            project = projectRepository.findById(taskDto.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
        }

        User assignedTo = null;
        if (taskDto.getAssignedToId() != null) {
            assignedTo = userRepository.findById(taskDto.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        Task task = Task.builder()
                .title(taskDto.getTitle())
                .description(taskDto.getDescription())
                .status(taskDto.getStatus() != null ? taskDto.getStatus() : TaskStatus.TODO)
                .project(project)
                .assignedTo(assignedTo)
                .build();

        Task savedTask = taskRepository.save(task);
        return mapToDto(savedTask);
    }

    @Override
    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        return mapToDto(task);
    }

    @Override
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto updateTask(Long id, TaskDto taskDto) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));

        if (taskDto.getProjectId() != null) {
            Project project = projectRepository.findById(taskDto.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            task.setProject(project);
        }

        if (taskDto.getAssignedToId() != null) {
            User assignedTo = userRepository.findById(taskDto.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignedTo(assignedTo);
        }

        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        if (taskDto.getStatus() != null) {
            task.setStatus(taskDto.getStatus());
        }

        Task updatedTask = taskRepository.save(task);
        return mapToDto(updatedTask);
    }

    @Override
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    @Override
    public TaskDto updateTaskStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        return mapToDto(updatedTask);
    }

    private TaskDto mapToDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .projectId(task.getProject() != null ? task.getProject().getId() : null)
                .assignedToId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null)
                .build();
    }
}
