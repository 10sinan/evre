package com.evre.service;

import com.evre.dto.AnalyticsSummaryDto;

public interface AnalyticsService {
    AnalyticsSummaryDto getProjectSummary(Long projectId);
}
