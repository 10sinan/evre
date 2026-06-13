package com.evre.service.impl;

import com.evre.dto.TaskDto;
import com.evre.model.Project;
import com.evre.model.Task;
import com.evre.model.TaskStatus;
import com.evre.model.User;
import com.evre.repository.ProjectRepository;
import com.evre.repository.TaskRepository;
import com.evre.model.ActivityLog;
import com.evre.dto.ActivityLogDto;
import com.evre.repository.ActivityLogRepository;
import com.evre.repository.UserRepository;
import com.evre.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private String getCurrentUsername() {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        }
        return "System";
    }

    private void logActivity(String message, Project project) {
        if (project == null) return;
        
        ActivityLog log = ActivityLog.builder()
                .message(message)
                .timestamp(LocalDateTime.now())
                .project(project)
                .build();
                
        ActivityLog savedLog = activityLogRepository.save(log);
        
        ActivityLogDto logDto = ActivityLogDto.builder()
                .id(savedLog.getId())
                .message(savedLog.getMessage())
                .timestamp(savedLog.getTimestamp())
                .projectId(project.getId())
                .build();
                
        messagingTemplate.convertAndSend("/topic/projects/" + project.getId() + "/logs", logDto);
    }

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
                .priority(taskDto.getPriority() != null ? taskDto.getPriority() : "NORMAL")
                .status(taskDto.getStatus() != null ? taskDto.getStatus() : TaskStatus.TODO)
                .project(project)
                .assignedTo(assignedTo)
                .build();

        Task savedTask = taskRepository.save(task);
        TaskDto savedDto = mapToDto(savedTask);
        messagingTemplate.convertAndSend("/topic/tasks", savedDto);
        
        String username = getCurrentUsername();
        logActivity(username + " yeni bir görev oluşturdu: " + savedTask.getTitle(), project);
        
        return savedDto;
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
    public List<TaskDto> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
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
        task.setPriority(taskDto.getPriority() != null ? taskDto.getPriority() : "NORMAL");
        if (taskDto.getStatus() != null) {
            task.setStatus(taskDto.getStatus());
        }

        Task updatedTask = taskRepository.save(task);
        TaskDto updatedDto = mapToDto(updatedTask);
        messagingTemplate.convertAndSend("/topic/tasks", updatedDto);
        
        String username = getCurrentUsername();
        logActivity(username + ", '" + updatedTask.getTitle() + "' görevini güncelledi.", updatedTask.getProject());
        
        return updatedDto;
    }

    @Override
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    @Override
    public TaskDto updateTaskStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        TaskStatus oldStatus = task.getStatus();
        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        TaskDto updatedDto = mapToDto(updatedTask);
        messagingTemplate.convertAndSend("/topic/tasks", updatedDto);
        
        String username = getCurrentUsername();
        logActivity(username + ", '" + updatedTask.getTitle() + "' görevini " + oldStatus + " durumundan " + status + " durumuna taşıdı.", updatedTask.getProject());
        
        return updatedDto;
    }

    private TaskDto mapToDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority() != null ? task.getPriority() : "NORMAL")
                .projectId(task.getProject() != null ? task.getProject().getId() : null)
                .assignedToId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null)
                .build();
    }
}
