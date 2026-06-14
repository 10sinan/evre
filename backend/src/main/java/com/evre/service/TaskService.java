package com.evre.service;

import com.evre.dto.TaskDto;
import com.evre.model.Task;
import com.evre.model.TaskStatus;
import java.util.List;

public interface TaskService extends BaseService<Task, TaskDto, Long> {
    TaskDto createTask(TaskDto taskDto);
    TaskDto getTaskById(Long id);
    List<TaskDto> getAllTasks();
    List<TaskDto> getTasksByProjectId(Long projectId);
    TaskDto updateTask(Long id, TaskDto taskDto);
    void deleteTask(Long id);
    TaskDto updateTaskStatus(Long id, TaskStatus status);
}
