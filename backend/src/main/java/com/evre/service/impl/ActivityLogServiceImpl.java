package com.evre.service.impl;

import com.evre.dto.ActivityLogDto;
import com.evre.repository.ActivityLogRepository;
import com.evre.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    public List<ActivityLogDto> getLogsByProjectId(Long projectId) {
        return activityLogRepository.findByProjectIdOrderByTimestampDesc(projectId).stream()
                .map(log -> ActivityLogDto.builder()
                        .id(log.getId())
                        .message(log.getMessage())
                        .timestamp(log.getTimestamp())
                        .projectId(log.getProject().getId())
                        .build())
                .collect(Collectors.toList());
    }
}
