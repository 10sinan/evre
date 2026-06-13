package com.evre.service.impl;

import com.evre.dto.SubTaskDto;
import com.evre.dto.TaskDto;
import com.evre.model.SubTask;
import com.evre.model.Task;
import com.evre.repository.SubTaskRepository;
import com.evre.repository.TaskRepository;
import com.evre.service.SubTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubTaskServiceImpl implements SubTaskService {

    private final TaskRepository taskRepository;
    private final SubTaskRepository subTaskRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public TaskDto addSubTask(Long taskId, SubTaskDto subTaskDto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        SubTask subTask = SubTask.builder()
                .title(subTaskDto.getTitle())
                .isCompleted(false)
                .task(task)
                .build();

        subTaskRepository.save(subTask);
        
        if (task.getSubTasks() == null) {
            task.setSubTasks(new ArrayList<>());
        }
        task.getSubTasks().add(subTask);

        TaskDto updatedTaskDto = mapToDto(task);
        messagingTemplate.convertAndSend("/topic/tasks", updatedTaskDto);
        return updatedTaskDto;
    }

    @Override
    @Transactional
    public TaskDto toggleSubTask(Long subTaskId) {
        SubTask subTask = subTaskRepository.findById(subTaskId)
                .orElseThrow(() -> new RuntimeException("SubTask not found"));

        subTask.setCompleted(!subTask.isCompleted());
        subTaskRepository.save(subTask);

        Task task = subTask.getTask();
        TaskDto updatedTaskDto = mapToDto(task);
        messagingTemplate.convertAndSend("/topic/tasks", updatedTaskDto);
        return updatedTaskDto;
    }

    private TaskDto mapToDto(Task task) {
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
                .build();
    }
}
