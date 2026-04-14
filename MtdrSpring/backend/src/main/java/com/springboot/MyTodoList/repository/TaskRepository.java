package com.springboot.MyTodoList.repository;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Buscar tareas de un usuario específico
    List<Task> findByUser(User user);

    // Para que el bot pueda listar las tareas del usuario que pregunta
    List<Task> findByUser_TelegramId(Long telegramId);

    // Buscar tareas por estado (ej: 'Pendiente', 'En curso') y si están activas o no
    List<Task> findByTaskStatusAndIsActive(String status, Integer isActive);

    // Buscar tareas activas de un usuario
    List<Task> findByUserAndIsActive(User user, Integer isActive);

    // Promedio de horas trabajadas por cada miembro de un equipo (sólo está considerando a los usuarios que tienen tareas registradas con su id en Task)
    @Query("SELECT SUM(t.totalHoursWorked) / COUNT(DISTINCT u.userId) " +
       "FROM Task t " +
       "JOIN t.user u " +
       "WHERE u.team.teamId = :teamId")
    Float getAverageWorkedHoursByTeam(@Param("teamId") Long teamId);
}