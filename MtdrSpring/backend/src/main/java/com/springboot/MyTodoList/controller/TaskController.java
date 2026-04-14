package com.springboot.MyTodoList.controller;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    private TaskRepository taskRepository;


    // Obtener todas las tareas en la base de datos
    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Obtener todas las tareas de un usuario específico
    @GetMapping("/by-developer/{userId}")
    public List<Task> getTasksByDeveloper(@PathVariable Long userId) {
        User user = new User();
        user.setUserId(userId);
        
        return taskRepository.findByUser(user);
    }

    // Obtener el promedio de horas trabajadas por cada equipo
    @GetMapping("/hours/average-by-team/{teamId}")
    public Float averageWorkedHoursByTeam(@PathVariable Long teamId) {
        // Llamamos directamente al query que definiste en el repositorio
        Float average = taskRepository.getAverageWorkedHoursByTeam(teamId);
        
        // Si el promedio es null, se envía cero
        return (average != null) ? average : 0.0f;
    }
}
