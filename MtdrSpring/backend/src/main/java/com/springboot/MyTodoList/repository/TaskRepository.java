package com.springboot.MyTodoList.repository;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.User;

import jakarta.transaction.Transactional;

import com.springboot.MyTodoList.dto.DeveloperHours;
import com.springboot.MyTodoList.dto.TaskTypeCount;
import com.springboot.MyTodoList.dto.TaskByDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
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

   // Obtener tareas activas del equipo de un manager, con filtros opcionales.
   @Query("SELECT t FROM Task t " +
      "JOIN t.user u " +
      "WHERE u.team.teamId = :teamId " +
      "AND u.role = 'DEVELOPER' " +
      "AND t.isActive = 1 " +
      "AND (:developerId IS NULL OR u.userId = :developerId) " +
      "AND (:status IS NULL OR t.taskStatus = :status) " +
      "AND (:startDateTime IS NULL OR t.creationDate >= :startDateTime) " +
      "AND (:endDateTime IS NULL OR t.creationDate < :endDateTime) " +
      "ORDER BY u.userId ASC, t.creationDate DESC")
   List<Task> findActiveTeamTasksByManagerFilters(
      @Param("teamId") Long teamId,
      @Param("developerId") Long developerId,
      @Param("status") String status,
      @Param("startDateTime") LocalDateTime startDateTime,
      @Param("endDateTime") LocalDateTime endDateTime
   );

    // Promedio de horas trabajadas por cada miembro de un equipo
    // Query para considerar sólo a los que tienen tareas registradas
    /*@Query("SELECT SUM(t.totalHoursWorked) / COUNT(DISTINCT u.userId) " +
       "FROM Task t " +
       "JOIN t.user u " +
       "WHERE u.team.teamId = :teamId")*/
       
    // Query para considerar a todos los miembros del equipo
    @Query("SELECT " +
       "(SELECT SUM(t.realDuration) FROM Task t WHERE t.user.team.teamId = :teamId) / " +
       "(SELECT COUNT(u) FROM User u WHERE u.team.teamId = :teamId) " +
       "FROM Team team WHERE team.teamId = :teamId")
    Float getAverageWorkedHoursByTeam(@Param("teamId") Long teamId);

    // Promedio de horas trabajadas por cada desarrollador
    @Query("SELECT AVG(t.realDuration) FROM Task t WHERE t.user.userId = :userId")
    Float getAverageWorkedHoursByDev(@Param("userId") Long userId);

    // Promedio de actividades finalizadas por cada miembro de un equipo
    @Query("SELECT (SELECT CAST(COUNT(t) AS float) FROM Task t WHERE t.user.team.teamId = :teamId AND t.taskStatus = 'Finalizada') / " +
       "(SELECT COUNT(u) FROM User u WHERE u.team.teamId = :teamId) " +
       "FROM Team tm WHERE tm.teamId = :teamId")
    Float getAverageFinishedTasksByTeam(@Param("teamId") Long teamId);

    // Promedio de actividades finalizadas por cada desarrollador
    @Query("SELECT CAST(COUNT(t) FILTER (WHERE t.taskStatus = 'Finalizada') AS float) / COUNT(t) " +
       "FROM Task t WHERE t.user.userId = :userId")
    Float getAverageFinishedTasksByDev(@Param("userId") Long userId);

    // Obtener el total de horas estimadas y trabajadas por un desarrollador (manejando nulos como 0)
    @Query("SELECT t.sprint_ AS sprint, " +
       "COALESCE(SUM(CAST(t.estimatedDuration AS double)), 0.0) AS totalEstimatedHours, " +
       "COALESCE(SUM(t.totalHoursWorked), 0.0) AS totalWorkedHours " +
       "FROM Task t " +
       "WHERE t.user.userId = :developerId " +
       "GROUP BY t.sprint_ " +
       "ORDER BY t.sprint_ ASC")
    List<DeveloperHours> getDeveloperHours(@Param("developerId") Long developerId);

    // Obtener la tasa de retrabajo de un equipo
    @Query("SELECT " +
       "(COUNT(CASE WHEN t.everFinished = 1 AND t.taskStatus != 'Finalizada' THEN 1 END) * 1.0) / " +
       "NULLIF(COUNT(CASE WHEN t.taskStatus = 'Finalizada' THEN 1 END), 0) " +
       "FROM Task t JOIN t.user u " + 
       "WHERE u.team.teamId = :teamId")
    Float getReworkRateByTeam(@Param("teamId") Long teamId);

    // Obtener la tasa de retrabajo de un desarrollador
    @Query("SELECT SUM(CASE WHEN t.everFinished = 1 AND t.taskStatus != 'Finalizada' THEN 1.0 ELSE 0.0 END) / " +
       "NULLIF(SUM(CASE WHEN t.taskStatus = 'Finalizada' THEN 1.0 ELSE 0.0 END), 0) " +
       "FROM Task t WHERE t.user.userId = :userId")
    Float getReworkRateByDev(@Param("userId") Long userId);

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

    // Obtener las tareas agrupadas por fecha de creación, por desarrollador
    @Query(value = "SELECT trunc(t.creationDate) AS taskDate, " +
               "COUNT(t.taskId) AS registered, " +
               "SUM(CASE WHEN t.taskStatus = 'Finalizada' THEN 1 ELSE 0 END) AS completed " +
               "FROM Task t " +
               "WHERE t.userId = :userId " +
               "GROUP BY trunc(t.creationDate) " +
               "ORDER BY taskDate DESC", nativeQuery = true)
    List<TaskByDate> getTasksGroupedByDateByDev(@Param("userId") Long userId);

    // Eliminar una tarea
    @Modifying
    @Transactional
    @Query("UPDATE Task t SET t.isActive = 0 WHERE t.taskId = :taskId")
    void deleteTask(@Param("taskId") Long taskId);
}