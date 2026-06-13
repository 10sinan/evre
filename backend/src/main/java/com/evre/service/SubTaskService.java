package com.evre.service;

import com.evre.dto.SubTaskDto;
import com.evre.dto.TaskDto;

public interface SubTaskService {
    TaskDto addSubTask(Long taskId, SubTaskDto subTaskDto);
    TaskDto toggleSubTask(Long subTaskId);
}
