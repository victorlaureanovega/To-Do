package com.springboot.MyTodoList.repository;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Buscar tareas de un usuario específico
    List<Task> findByUser(User user);

    // Para que el bot pueda listar las tareas del usuario que pregunta
    List<Task> findByUser_TelegramId(Long telegramId);

    // Buscar tareas por estado (ej: 'Pendiente', 'En curso')
    List<Task> findByTaskStatus(String status);

    // Buscar tareas activas de un usuario
    List<Task> findByUserAndIsActive(User user, Integer isActive);
}