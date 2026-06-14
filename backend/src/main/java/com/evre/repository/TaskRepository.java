package com.evre.repository;

import com.evre.model.Task;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends BaseRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    // Her görev durumundan kaç tane olduğunu gruplu olarak getirir
    @Query("SELECT t.status, COUNT(t) FROM Task t WHERE t.project.id = :projectId GROUP BY t.status")
    List<Object[]> countByStatusForProject(@Param("projectId") Long projectId);

    // Her kullanıcıya kaç görev atanmış olduğunu gruplu olarak getirir
    @Query("SELECT t.assignedTo.username, COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.assignedTo IS NOT NULL GROUP BY t.assignedTo.username")
    List<Object[]> countByAssigneeForProject(@Param("projectId") Long projectId);

    // Belirtilen zaman aralığında deadline'ı olan ve henüz DONE olmayan görevleri getirir
    @Query("SELECT t FROM Task t WHERE t.status <> com.evre.model.TaskStatus.DONE AND t.deadline IS NOT NULL AND t.deadline BETWEEN :from AND :to")
    List<Task> findTasksNearingDeadline(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // Toplam görev sayısı
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    Long countByProjectId(@Param("projectId") Long projectId);
}
