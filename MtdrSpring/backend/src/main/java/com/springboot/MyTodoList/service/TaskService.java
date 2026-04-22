package com.springboot.MyTodoList.service;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.TaskType;
import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.repository.TaskTypeRepository;
import com.springboot.MyTodoList.dto.TaskRequest;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskTypeRepository taskTypeRepository;

    // Usar el constructor para la inyección es más seguro y evita el error de null
    public TaskService(TaskRepository taskRepository, TaskTypeRepository taskTypeRepository) {
        this.taskRepository = taskRepository;
        this.taskTypeRepository = taskTypeRepository;
    }

    public TaskType getDefaultType() {
        // Buscamos el primer tipo disponible para no dejar la tarea sin tipo
        return taskTypeRepository.findAll().stream().findFirst().orElse(null);
    }

    public Task create(TaskRequest request) {
        Task task = new Task();
        task.setContent(request.getContent());
        task.setEstimatedDuration(request.getEstimatedDuration());
        task.setTaskStatus("Pendiente");
        task.setTotalHoursWorked(0.0);
        task.setIsActive(1);
        task.setEverFinished(0);
        task.setCreationDate(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public List<Task> findByTelegramId(Long telegramId) {
        return taskRepository.findByUser_TelegramId(telegramId);
    }

    public Task save(Task task) {
        return taskRepository.save(task);
    }

    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }

    public void deleteById(Long id) {
        taskRepository.deleteById(id);
    }

    public Optional<TaskType> findTypeByName(String name) {
        return taskTypeRepository.findByName(name);
    }
}