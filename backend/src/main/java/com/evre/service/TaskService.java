package com.evre.service;

import com.evre.dto.TaskDto;
import com.evre.model.TaskStatus;
import java.util.List;

public interface TaskService {
    TaskDto createTask(TaskDto taskDto);
    TaskDto getTaskById(Long id);
    List<TaskDto> getAllTasks();
    TaskDto updateTask(Long id, TaskDto taskDto);
    void deleteTask(Long id);
    TaskDto updateTaskStatus(Long id, TaskStatus status);
}
