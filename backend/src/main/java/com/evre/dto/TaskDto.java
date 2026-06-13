package com.evre.dto;

import com.evre.model.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private Long projectId;
    private Long assignedToId;
    private String priority;
    private LocalDateTime deadline;
    private java.util.List<SubTaskDto> subTasks;
    private java.util.List<CommentDto> comments;
}
