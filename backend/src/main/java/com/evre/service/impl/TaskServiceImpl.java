package com.evre.service.impl;

import com.evre.dto.TaskDto;
import com.evre.dto.SubTaskDto;
import com.evre.dto.CommentDto;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl extends BaseServiceImpl<Task, TaskDto, Long, TaskRepository> implements TaskService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public TaskServiceImpl(TaskRepository taskRepository,
                           ProjectRepository projectRepository,
                           UserRepository userRepository,
                           ActivityLogRepository activityLogRepository,
                           SimpMessagingTemplate messagingTemplate) {
        super(taskRepository);
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.messagingTemplate = messagingTemplate;
    }

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
    protected TaskDto mapToDto(Task task) {
        if (task == null) return null;
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority() != null ? task.getPriority() : "NORMAL")
                .deadline(task.getDeadline())
                .projectId(task.getProject() != null ? task.getProject().getId() : null)
                .assignedToId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null)
                .subTasks(task.getSubTasks() != null ? task.getSubTasks().stream()
                        .map(st -> SubTaskDto.builder()
                                .id(st.getId())
                                .title(st.getTitle())
                                .isCompleted(st.isCompleted())
                                .build())
                        .collect(Collectors.toList()) : null)
                .comments(task.getComments() != null ? task.getComments().stream()
                        .map(c -> CommentDto.builder()
                                .id(c.getId())
                                .content(c.getContent())
                                .createdAt(c.getCreatedAt())
                                .authorId(c.getAuthor() != null ? c.getAuthor().getId() : null)
                                .authorUsername(c.getAuthor() != null ? c.getAuthor().getUsername() : null)
                                .build())
                        .collect(Collectors.toList()) : null)
                .build();
    }

    @Override
    protected Task mapToEntity(TaskDto taskDto) {
        if (taskDto == null) return null;
        
        Project project = null;
        if (taskDto.getProjectId() != null) {
            project = projectRepository.findById(taskDto.getProjectId()).orElse(null);
        }

        User assignedTo = null;
        if (taskDto.getAssignedToId() != null) {
            assignedTo = userRepository.findById(taskDto.getAssignedToId()).orElse(null);
        }

        return Task.builder()
                .id(taskDto.getId())
                .title(taskDto.getTitle())
                .description(taskDto.getDescription())
                .priority(taskDto.getPriority() != null ? taskDto.getPriority() : "NORMAL")
                .deadline(taskDto.getDeadline())
                .status(taskDto.getStatus() != null ? taskDto.getStatus() : TaskStatus.TODO)
                .project(project)
                .assignedTo(assignedTo)
                .build();
    }

    @Override
    public TaskDto save(TaskDto taskDto) {
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
                .deadline(taskDto.getDeadline())
                .status(taskDto.getStatus() != null ? taskDto.getStatus() : TaskStatus.TODO)
                .project(project)
                .assignedTo(assignedTo)
                .build();

        Task savedTask = repository.save(task);
        TaskDto savedDto = mapToDto(savedTask);
        messagingTemplate.convertAndSend("/topic/tasks", savedDto);
        
        String username = getCurrentUsername();
        logActivity(username + " yeni bir görev oluşturdu: " + savedTask.getTitle(), project);
        
        return savedDto;
    }

    @Override
    public TaskDto findById(Long id) {
        Task task = repository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        return mapToDto(task);
    }

    @Override
    public List<TaskDto> findAll() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Task not found");
        }
        repository.deleteById(id);
    }

    @Override
    public TaskDto update(Long id, TaskDto taskDto) {
        Task task = repository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));

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
        if (taskDto.getDeadline() != null) {
            task.setDeadline(taskDto.getDeadline());
        }
        if (taskDto.getStatus() != null) {
            task.setStatus(taskDto.getStatus());
        }

        Task updatedTask = repository.save(task);
        TaskDto updatedDto = mapToDto(updatedTask);
        messagingTemplate.convertAndSend("/topic/tasks", updatedDto);
        
        String username = getCurrentUsername();
        logActivity(username + ", '" + updatedTask.getTitle() + "' görevini güncelledi.", updatedTask.getProject());
        
        return updatedDto;
    }

    // --- TaskService Specific / Legacy Methods ---

    @Override
    public TaskDto createTask(TaskDto taskDto) {
        return save(taskDto);
    }

    @Override
    public TaskDto getTaskById(Long id) {
        return findById(id);
    }

    @Override
    public List<TaskDto> getAllTasks() {
        return findAll();
    }

    @Override
    public List<TaskDto> getTasksByProjectId(Long projectId) {
        return repository.findByProjectId(projectId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto updateTask(Long id, TaskDto taskDto) {
        return update(id, taskDto);
    }

    @Override
    public void deleteTask(Long id) {
        deleteById(id);
    }

    @Override
    public TaskDto updateTaskStatus(Long id, TaskStatus status) {
        Task task = repository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        TaskStatus oldStatus = task.getStatus();
        task.setStatus(status);
        Task updatedTask = repository.save(task);
        TaskDto updatedDto = mapToDto(updatedTask);
        messagingTemplate.convertAndSend("/topic/tasks", updatedDto);
        
        String username = getCurrentUsername();
        logActivity(username + ", '" + updatedTask.getTitle() + "' görevini " + oldStatus + " durumundan " + status + " durumuna taşıdı.", updatedTask.getProject());
        
        return updatedDto;
    }
}
