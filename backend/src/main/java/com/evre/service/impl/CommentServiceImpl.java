package com.evre.service.impl;

import com.evre.dto.CommentDto;
import com.evre.dto.SubTaskDto;
import com.evre.dto.TaskDto;
import com.evre.model.Comment;
import com.evre.model.Task;
import com.evre.model.User;
import com.evre.repository.CommentRepository;
import com.evre.repository.TaskRepository;
import com.evre.repository.UserRepository;
import com.evre.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public TaskDto addComment(Long taskId, CommentDto commentDto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User author = null;
        if (commentDto.getAuthorId() != null) {
            author = userRepository.findById(commentDto.getAuthorId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        Comment comment = Comment.builder()
                .content(commentDto.getContent())
                .createdAt(LocalDateTime.now())
                .task(task)
                .author(author)
                .build();

        commentRepository.save(comment);

        if (task.getComments() == null) {
            task.setComments(new ArrayList<>());
        }
        task.getComments().add(comment);

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
}
