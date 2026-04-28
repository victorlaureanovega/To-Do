package com.springboot.MyTodoList.controller;
import com.springboot.MyTodoList.model.Task;
//import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.dto.DeveloperHours;
import com.springboot.MyTodoList.dto.TaskTypeCount;
import com.springboot.MyTodoList.dto.TaskByDate;
import com.springboot.MyTodoList.dto.TaskRequest;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.repository.TaskTypeRepository;
import com.springboot.MyTodoList.repository.TeamRepository;
import com.springboot.MyTodoList.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TaskTypeRepository taskTypeRepository;
    @Autowired
    private SprintRepository sprintRepository;
    @Autowired
    private TeamRepository teamRepository;

    // Obtener todas las tareas en la base de datos
    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Obtener todas las tareas agrupadas por tipos
    @GetMapping("/by-type/by-team/{teamId}")
    public List<TaskTypeCount> getAllTasksByType(@PathVariable Long teamId) {
        return taskRepository.getAllTasksByType(teamId);
    }

    // Obtener todas las tareas de un usuario específico
    @GetMapping("/by-developer/{userId}")
    public List<Task> getTasksByDeveloper(@PathVariable Long userId) {
        User user = new User();
        user.setUserId(userId);
        
        return taskRepository.findByUser(user);
    }

    // Obtener tareas de equipo para un manager (solo lectura), con filtros opcionales.
    @GetMapping("/team/by-manager/{managerUserId}")
    public ResponseEntity<List<Task>> getTeamTasksByManager(
        @PathVariable Long managerUserId,
        @RequestParam(required = false) Long developerId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate
    ) {
        User manager = userRepository.findById(managerUserId)
            .orElseThrow(() -> new RuntimeException("Manager no encontrado"));

        if (!"MANAGER".equalsIgnoreCase(manager.getRole())) {
            return ResponseEntity.status(403).build();
        }

        Long teamId = teamRepository.findByManagerId(managerUserId)
            .map(team -> team.getTeamId())
            .orElseGet(() -> manager.getTeam() != null ? manager.getTeam().getTeamId() : null);

        if (teamId == null) {
            return ResponseEntity.badRequest().build();
        }

        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            return ResponseEntity.badRequest().build();
        }

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.plusDays(1).atStartOfDay() : null;

        List<Task> tasks = taskRepository.findActiveTeamTasksByManagerFilters(
            teamId,
            developerId,
            status,
            startDateTime,
            endDateTime
        );

        return ResponseEntity.ok(tasks);
    }

    // Obtener el promedio de horas trabajadas por cada equipo
    @GetMapping("/hours/average-by-team/{teamId}")
    public Float averageWorkedHoursByTeam(@PathVariable Long teamId) {
        Float average = taskRepository.getAverageWorkedHoursByTeam(teamId);
        
        // Si el promedio es null, se envía cero
        return (average != null) ? average : 0.0f;
    }

    // Obtener el promedio de horas trabajadas por cada desarrollador
    @GetMapping("/hours/average-by-dev/{userId}")
    public Float averageWorkedHoursByDev(@PathVariable Long userId) {
        Float average = taskRepository.getAverageWorkedHoursByDev(userId);

        return (average != null) ? average : 0.0f;
    }

    // Obtener el promedio de tareas finalizadas por cada miembro del equipo
    @GetMapping("/average-by-team/{teamId}")
    public Float averageFinishedTasksByTeam(@PathVariable Long teamId) {
        Float average = taskRepository.getAverageFinishedTasksByTeam(teamId);

        return average;
    }

    // Obtener el promedio de tareas finalizadas por desarrollador
    @GetMapping("/average-by-dev/{userId}")
    public Float averageFinishedTasksByDev(@PathVariable Long userId) {
        Float average = taskRepository.getAverageFinishedTasksByDev(userId);

        return (average != null) ? average : 0.0f;
    }

    // Get total estimated and worked hours by a developer
    @GetMapping("/hours/by-developer/{developerId}")
    public List<DeveloperHours> getHoursByDeveloper(@PathVariable Long developerId) {
        return taskRepository.getDeveloperHours(developerId);
    }

    // Obtener la tasa de retrabajo de un equipo
    @GetMapping("/rework-rate/by-team/{teamId}")
    public Float getReworkRateByTeam(@PathVariable Long teamId) {
        Float rate = taskRepository.getReworkRateByTeam(teamId);

        return rate;
    }

    // Obtener la tasa de retrabajo de un desarrollador
    @GetMapping("rework-rate/by-dev/{userId}")
    public Float getReworkRateByDev(@PathVariable Long userId) {
        Float rate = taskRepository.getReworkRateByDev(userId);

        return rate;
    }

    // Obtener las tareas que fueron creadas en cierto día y su relación con las que fueron finalizadas
    @GetMapping("/grouped-by-date")
    public List<TaskByDate> getTasksGroupedByDate() {
        return taskRepository.getTasksGroupedByDate();
    }

    // Obtener las tareas que fueron creadas en cierto día y su relación con las que fueron finalizadas, por desarrollador
    @GetMapping("/grouped-by-date/{userId}")
    public List<TaskByDate> getTasksGroupedByDateByDev(@PathVariable Long userId) {
        return taskRepository.getTasksGroupedByDateByDev(userId);
    }

    // Crear tarea
    @PostMapping
    public Task createTask(@RequestBody TaskRequest dto) {
        Task task = new Task();
        task.setContent(dto.getContent());
        task.setEstimatedDuration(dto.getEstimatedDuration());
        
        // Buscar las entidades por ID
        task.setUser(userRepository.findById(dto.getUserId())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        
        task.setType(taskTypeRepository.findById(dto.getTypeId())
            .orElseThrow(() -> new RuntimeException("Tipo de tarea no encontrado")));

        task.set_Sprint(dto.getSprintNumber());
        
        // El sprint es opcional (puede ser null para el Backlog)
        if (dto.getSprintId() != null) {
            task.setSprint(sprintRepository.findById(dto.getSprintId())
                .orElseThrow(() -> new RuntimeException("Sprint no encontrado")));
        }

        return taskRepository.save(task);
    }

    // Editar tarea
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody TaskRequest dto) {
        // Buscar la tarea existente
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada con ID: " + id));

        // Actualizar campos básicos
        task.setContent(dto.getContent());
        task.setEstimatedDuration(dto.getEstimatedDuration());

        // Actualizar el valor numérico del sprint
        if (dto.getSprintNumber() != null) {
            task.set_Sprint(dto.getSprintNumber());
        }
        if (dto.getRealDuration() != null) {
            task.setRealDuration(dto.getRealDuration());
            task.setTotalHoursWorked(dto.getRealDuration().doubleValue());
        }

        // Actualizar relaciones (sólo si los IDs vienen en el DTO)
        if (dto.getUserId() != null) {
            task.setUser(userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        }
        
        if (dto.getTypeId() != null) {
            task.setType(taskTypeRepository.findById(dto.getTypeId())
                .orElseThrow(() -> new RuntimeException("Tipo de tarea no encontrado")));
        }

        // El Sprint puede ser null (si se mueve al backlog) o un ID nuevo
        if (dto.getSprintId() != null) {
            task.setSprint(sprintRepository.findById(dto.getSprintId())
                .orElseThrow(() -> new RuntimeException("Sprint no encontrado")));
        } else {
            task.setSprint(null);
        }

        // Guardar cambios
        return taskRepository.save(task);
    }

    // Editar estado de una tarea
    @PatchMapping("/status/{id}")
    public Task updateTaskStatus(@PathVariable Long id, @RequestParam String status) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        task.setTaskStatus(status);

        // Si el estado es 'Finalizada' se pone la fecha actual
        if ("Finalizada".equalsIgnoreCase(status)) {
            task.setFinishDate(new java.sql.Date(System.currentTimeMillis()));
            task.setEverFinished(1);
        }

        return taskRepository.save(task);
    }

    // Eliminar tarea
    @PatchMapping("/delete/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskRepository.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}
