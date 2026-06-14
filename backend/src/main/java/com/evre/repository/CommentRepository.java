package com.evre.repository;

import com.evre.model.Comment;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends BaseRepository<Comment, Long> {
}
