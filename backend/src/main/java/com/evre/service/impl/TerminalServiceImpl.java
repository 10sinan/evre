package com.evre.service.impl;

import com.evre.dto.TerminalRequest;
import com.evre.dto.TaskDto;
import com.evre.model.Project;
import com.evre.model.Task;
import com.evre.model.TaskStatus;
import com.evre.repository.ProjectRepository;
import com.evre.repository.TaskRepository;
import com.evre.service.TerminalService;
import com.evre.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TerminalServiceImpl implements TerminalService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskService taskService;

    @Override
    @Transactional
    public String executeCommand(TerminalRequest request) {
        String cmdText = request.getCommand();
        if (cmdText == null || cmdText.trim().isEmpty()) {
            return "Hata: Komut boş olamaz.";
        }

        cmdText = cmdText.trim();
        List<String> tokens = parseArguments(cmdText);
        if (tokens.isEmpty()) {
            return "Hata: Geçersiz komut formatı.";
        }

        String mainCommand = tokens.get(0);

        if ("task".equalsIgnoreCase(mainCommand)) {
            if (tokens.size() < 2) {
                return "Hata: 'task' komutu için alt komut belirtmelisiniz (create, move).";
            }
            String subCommand = tokens.get(1);
            if ("create".equalsIgnoreCase(subCommand)) {
                return handleTaskCreate(tokens, request.getProjectId());
            } else if ("move".equalsIgnoreCase(subCommand)) {
                return handleTaskMove(tokens);
            } else {
                return "Hata: Bilinmeyen task alt komutu '" + subCommand + "'. Sadece 'create' ve 'move' destekleniyor.";
            }
        } else if ("board".equalsIgnoreCase(mainCommand)) {
            if (tokens.size() < 2) {
                return "Hata: 'board' komutu için alt komut belirtmelisiniz (stats).";
            }
            String subCommand = tokens.get(1);
            if ("stats".equalsIgnoreCase(subCommand)) {
                return handleBoardStats(request.getProjectId());
            } else {
                return "Hata: Bilinmeyen board alt komutu '" + subCommand + "'. Sadece 'stats' destekleniyor.";
            }
        }

        return "Hata: Bilinmeyen komut '" + mainCommand + "'. Mevcut komutlar: task, board";
    }

    private String handleTaskCreate(List<String> tokens, Long projectId) {
        if (projectId == null) {
            return "Hata: Bir projenin içinde olmalısınız veya projectId belirtilmelidir.";
        }

        String title = null;
        String priority = "NORMAL";

        for (int i = 2; i < tokens.size(); i++) {
            if ("--title".equalsIgnoreCase(tokens.get(i)) && i + 1 < tokens.size()) {
                title = tokens.get(i + 1);
                i++;
            } else if ("--priority".equalsIgnoreCase(tokens.get(i)) && i + 1 < tokens.size()) {
                priority = tokens.get(i + 1).toUpperCase();
                i++;
            }
        }

        if (title == null || title.trim().isEmpty()) {
            return "Hata: Görev oluşturmak için '--title \"Görev Adı\"' parametresi zorunludur.";
        }

        try {
            TaskDto taskDto = TaskDto.builder()
                    .title(title)
                    .description("Terminal üzerinden oluşturuldu.")
                    .priority(priority)
                    .status(TaskStatus.TODO)
                    .projectId(projectId)
                    .build();

            TaskDto saved = taskService.createTask(taskDto);
            return "Başarılı: " + saved.getId() + " ID'li '" + saved.getTitle() + "' görevi (" + priority + ") oluşturuldu.";
        } catch (Exception e) {
            return "Hata: Görev oluşturulurken bir hata oluştu: " + e.getMessage();
        }
    }

    private String handleTaskMove(List<String> tokens) {
        Long id = null;
        String statusStr = null;

        for (int i = 2; i < tokens.size(); i++) {
            if ("--id".equalsIgnoreCase(tokens.get(i)) && i + 1 < tokens.size()) {
                try {
                    id = Long.parseLong(tokens.get(i + 1));
                } catch (NumberFormatException e) {
                    return "Hata: --id parametresi sayı olmalıdır.";
                }
                i++;
            } else if ("--status".equalsIgnoreCase(tokens.get(i)) && i + 1 < tokens.size()) {
                statusStr = tokens.get(i + 1).toUpperCase();
                i++;
            }
        }

        if (id == null) {
            return "Hata: Görev taşımak için '--id [ID]' parametresi zorunludur.";
        }
        if (statusStr == null) {
            return "Hata: Görev taşımak için '--status [DURUM]' parametresi zorunludur.";
        }

        TaskStatus status;
        try {
            status = TaskStatus.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            return "Hata: Geçersiz durum '" + statusStr + "'. Kabul edilen durumlar: TODO, IN_PROGRESS, DONE";
        }

        try {
            TaskDto updated = taskService.updateTaskStatus(id, status);
            return "Başarılı: " + updated.getId() + " ID'li görev durumu '" + status + "' olarak güncellendi.";
        } catch (Exception e) {
            return "Hata: Görev taşınırken hata oluştu: " + e.getMessage();
        }
    }

    private String handleBoardStats(Long projectId) {
        if (projectId == null) {
            return "Hata: İstatistikleri çekebilmek için aktif bir projectId gereklidir.";
        }

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return "Hata: Proje bulunamadı.";
        }

        List<Task> tasks = taskRepository.findByProjectId(projectId);
        long todoCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgressCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long doneCount = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long totalCount = tasks.size();

        StringBuilder sb = new StringBuilder();
        sb.append("+------------------------------------------+\n");
        sb.append(String.format("| Pano Adı: %-30s |\n", project.getName()));
        sb.append("+---------------------+--------------------+\n");
        sb.append(String.format("| %-19s | %-18d |\n", "Toplam Görev", totalCount));
        sb.append(String.format("| %-19s | %-18d |\n", "Bekleyen (TODO)", todoCount));
        sb.append(String.format("| %-19s | %-18d |\n", "Devam Eden", inProgressCount));
        sb.append(String.format("| %-19s | %-18d |\n", "Tamamlanan (DONE)", doneCount));
        sb.append("+---------------------+--------------------+");

        return sb.toString();
    }

    /**
     * Arguments parser that respects single or double quotes for arguments
     */
    private List<String> parseArguments(String text) {
        List<String> list = new ArrayList<>();
        Matcher m = Pattern.compile("([^\"]\\S*|\"[^\"]*\")\\s*").matcher(text);
        while (m.find()) {
            String val = m.group(1);
            if (val.startsWith("\"") && val.endsWith("\"")) {
                val = val.substring(1, val.length() - 1);
            }
            list.add(val);
        }
        return list;
    }
}
