package com.evre.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDto {

    /**
     * Projedeki toplam görev sayısı
     */
    private Long totalTasks;

    /**
     * Görev durumlarına göre dağılım
     * Örnek: { "TODO": 5, "IN_PROGRESS": 2, "DONE": 10 }
     */
    private Map<String, Long> statusCounts;

    /**
     * Kullanıcı bazlı görev dağılımı
     * Örnek: { "sinan": 7, "ahmet": 3 }
     */
    private Map<String, Long> userTaskCounts;
}
