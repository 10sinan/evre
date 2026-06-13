package com.evre.service;

import com.evre.dto.ActivityLogDto;
import java.util.List;

public interface ActivityLogService {
    List<ActivityLogDto> getLogsByProjectId(Long projectId);
}
