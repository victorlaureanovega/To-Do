/*package com.springboot.MyTodoList.service;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.repository.TaskRepository;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;

    public Task create(TaskRequest request) {
        Task task = new Task();
        
        task.setUserId(request.userId());
        task.setTypeId(request.typeId());
        task.setContent(request.content());
        task.setEstimatedDuration(request.estimatedDuration());
        
        // Valores por defecto para una tarea nueva
        task.setTaskStatus("Pendiente");
        task.setTotalHoursWorked(0.0);
        task.setRealDuration(0.0);
        task.setIsActive(1);
        task.setEverFinished(0);
        task.setCreationDate(LocalDateTime.now());
        
        return taskRepository.save(task);
    }
}*/
