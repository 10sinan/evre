package com.evre.service;

import com.evre.model.Task;
import com.evre.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final TaskRepository taskRepository;
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@evre.app}")
    private String fromEmail;

    /**
     * Her gece saat 00:00'da çalışır.
     * Deadline'ına 24 saatten az kalmış ve henüz DONE olmayan tüm görevleri tarar.
     * Göreve atanmış kullanıcıya e-posta gönderir.
     *
     * Cron ifadesi: saniye dakika saat günAy ay günHafta
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void sendDeadlineReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in24Hours = now.plusHours(24);

        log.info("[NotificationService] Deadline taraması başlatıldı: {} - {}", now, in24Hours);

        List<Task> tasksDueSoon = taskRepository.findTasksNearingDeadline(now, in24Hours);

        if (tasksDueSoon.isEmpty()) {
            log.info("[NotificationService] Yaklaşan deadline bulunamadı.");
            return;
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

        for (Task task : tasksDueSoon) {
            // Göreve atanmış kullanıcı yoksa atla
            if (task.getAssignedTo() == null || task.getAssignedTo().getEmail() == null) {
                log.warn("[NotificationService] '{}' görevine atanmış kullanıcı veya e-posta bulunamadı, atlanıyor.", task.getTitle());
                continue;
            }

            String recipientName = task.getAssignedTo().getUsername();
            String recipientEmail = task.getAssignedTo().getEmail();
            String taskTitle = task.getTitle();
            String deadlineFormatted = task.getDeadline().format(formatter);

            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(recipientEmail);
                message.setSubject("⏰ Evre Hatırlatma: '" + taskTitle + "' görevin bitiyor!");
                message.setText(
                    "Merhaba " + recipientName + ",\n\n" +
                    "'" + taskTitle + "' görevinin bitiş tarihine (deadline) 24 saatten az kaldı.\n\n" +
                    "📅 Bitiş Tarihi: " + deadlineFormatted + "\n\n" +
                    "Lütfen Evre panonuzu kontrol edin ve gerekli adımları atmayı unutmayın.\n\n" +
                    "Başarılar!\n" +
                    "— Evre Ekibi"
                );

                mailSender.send(message);
                log.info("[NotificationService] Hatırlatma e-postası gönderildi → {}", recipientEmail);

            } catch (Exception e) {
                log.error("[NotificationService] E-posta gönderilemedi → {}: {}", recipientEmail, e.getMessage());
            }
        }

        log.info("[NotificationService] Tarama tamamlandı. {} adet hatırlatma işlendi.", tasksDueSoon.size());
    }
}
