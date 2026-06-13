package com.evre.service.impl;

import com.evre.dto.AnalyticsSummaryDto;
import com.evre.model.TaskStatus;
import com.evre.repository.TaskRepository;
import com.evre.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TaskRepository taskRepository;

    @Override
    public AnalyticsSummaryDto getProjectSummary(Long projectId) {
        // 1. Toplam görev sayısı
        Long totalTasks = taskRepository.countByProjectId(projectId);

        // 2. Durum bazlı dağılım — Object[] = [TaskStatus, Long]
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        // Sıfırlık garantisi: başlangıçta tüm statüsleri 0 ile doldur
        for (TaskStatus status : TaskStatus.values()) {
            statusCounts.put(status.name(), 0L);
        }
        taskRepository.countByStatusForProject(projectId).forEach(row -> {
            TaskStatus status = (TaskStatus) row[0];
            Long count = (Long) row[1];
            statusCounts.put(status.name(), count);
        });

        // 3. Kullanıcı bazlı dağılım — Object[] = [username (String), Long]
        Map<String, Long> userTaskCounts = new LinkedHashMap<>();
        taskRepository.countByAssigneeForProject(projectId).forEach(row -> {
            String username = (String) row[0];
            Long count = (Long) row[1];
            userTaskCounts.put(username, count);
        });

        return AnalyticsSummaryDto.builder()
                .totalTasks(totalTasks)
                .statusCounts(statusCounts)
                .userTaskCounts(userTaskCounts)
                .build();
    }
}
