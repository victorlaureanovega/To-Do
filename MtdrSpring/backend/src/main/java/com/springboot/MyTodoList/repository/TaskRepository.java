package com.springboot.MyTodoList.repository;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.dto.DeveloperHours;
import com.springboot.MyTodoList.dto.TaskTypeCount;

import org.checkerframework.checker.units.qual.t;
import com.springboot.MyTodoList.dto.TaskByDate;
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

    // Promedio de horas trabajadas por cada miembro de un equipo
    // Query para considerar sólo a los que tienen tareas registradas
    /*@Query("SELECT SUM(t.totalHoursWorked) / COUNT(DISTINCT u.userId) " +
       "FROM Task t " +
       "JOIN t.user u " +
       "WHERE u.team.teamId = :teamId")*/
       
    // Query para considerar a todos los miembros del equipo
    @Query("SELECT " +
       "(SELECT SUM(t.totalHoursWorked) FROM Task t WHERE t.user.team.teamId = :teamId) / " +
       "(SELECT COUNT(u) FROM User u WHERE u.team.teamId = :teamId) " +
       "FROM Team team WHERE team.teamId = :teamId")
    Float getAverageWorkedHoursByTeam(@Param("teamId") Long teamId);

    // Promedio de actividades finalizadas por cada miembro de un equipo
    @Query("SELECT (SELECT CAST(COUNT(t) AS float) FROM Task t WHERE t.user.team.teamId = :teamId AND t.taskStatus = 'Finalizada') / " +
       "(SELECT COUNT(u) FROM User u WHERE u.team.teamId = :teamId) " +
       "FROM Team tm WHERE tm.teamId = :teamId")
    Float getAverageFinishedTasksByTeam(@Param("teamId") Long teamId);

    // Obtener el total de horas estimadas y trabajadas por un desarrollador (manejando nulos como 0)
    @Query("SELECT COALESCE(SUM(t.estimatedDuration), 0.0) AS totalEstimatedHours, " +
           "COALESCE(SUM(t.totalHoursWorked), 0.0) AS totalWorkedHours " +
           "FROM Task t WHERE t.user.userId = :developerId")
    DeveloperHours getDeveloperHours(@Param("developerId") Long developerId);

    // Obtener la tasa de retrabajo de un equipo
    @Query("SELECT " +
       "(COUNT(CASE WHEN t.everFinished = 1 AND t.taskStatus != 'Finalizada' THEN 1 END) * 1.0) / " +
       "NULLIF(COUNT(CASE WHEN t.taskStatus = 'Finalizada' THEN 1 END), 0) " +
       "FROM Task t JOIN t.user u " + 
       "WHERE u.team.teamId = :teamId")
    Float getReworkRateByTeam(@Param("teamId") Long teamId);

    // Obtener todas las tareas por tipo
    @Query("SELECT tt.name AS typeName, COUNT(t) AS count " +
       "FROM Task t " + "JOIN t.type tt " +
       "JOIN t.user u " + "WHERE u.team.teamId = :teamId " +
       "GROUP BY tt.name")
    List<TaskTypeCount> getAllTasksByType(@Param("teamId") Long teamId);

    // Get all tasks grouped by creation date (Total vs Completed)
    @Query(value = "SELECT trunc(t.creationDate) AS taskDate, " +
           "COUNT(t.taskId) AS registered, " +
           "SUM(CASE WHEN t.taskStatus = 'Finalizada' THEN 1 ELSE 0 END) AS completed " +
           "FROM Task t " +
           "GROUP BY trunc(t.creationDate)", nativeQuery = true)
    List<TaskByDate> getTasksGroupedByDate();
}