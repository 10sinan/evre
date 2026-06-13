package com.evre.service;

import com.evre.dto.CommentDto;
import com.evre.dto.TaskDto;

public interface CommentService {
    TaskDto addComment(Long taskId, CommentDto commentDto);
}
