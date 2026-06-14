package com.evre.repository;

import com.evre.model.Project;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends BaseRepository<Project, Long> {
    List<Project> findByOwnerId(Long ownerId);
}
