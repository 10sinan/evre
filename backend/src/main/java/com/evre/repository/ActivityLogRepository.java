package com.evre.repository;

import com.evre.model.ActivityLog;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends BaseRepository<ActivityLog, Long> {
    List<ActivityLog> findByProjectIdOrderByTimestampDesc(Long projectId);
}
