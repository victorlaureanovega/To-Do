package com.springboot.MyTodoList.config;
import com.springboot.MyTodoList.dto.TaskTypeCount;
import com.springboot.MyTodoList.dto.TaskByDate;
import com.springboot.MyTodoList.model.*;
import com.springboot.MyTodoList.repository.*;
import oracle.jdbc.pool.OracleDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.List;

@Configuration
public class OracleConfiguration {
    Logger logger = LoggerFactory.getLogger(OracleConfiguration.class);

    @Autowired
    private Environment env;

    @Bean
    public DataSource dataSource() throws SQLException {
        OracleDataSource ds = new OracleDataSource();
        ds.setDriverType(env.getProperty("driver_class_name"));
        ds.setURL(env.getProperty("db_url"));
        ds.setUser(env.getProperty("db_user"));
        ds.setPassword(env.getProperty("dbpassword"));
        return ds;
    }

    @Bean
    public org.springframework.boot.CommandLineRunner connectionChecker(
            DataSource ds, 
            TaskRepository taskRepository,
            UserRepository userRepository,
            TaskTypeRepository taskTypeRepository,
            SprintRepository sprintRepository) {
        
        return args -> {
            System.out.println("\n============================================");
            System.out.println("   INICIANDO PRUEBAS DE SISTEMA (ORACLE)    ");
            System.out.println("============================================\n");

            try (java.sql.Connection conn = ds.getConnection()) {
                // 1. Conexión Básica
                System.out.println("[OK] JDBC: Conexión establecida con éxito.");
                System.out.println("[INFO] Usuario DB: " + conn.getMetaData().getUserName());

                // 2. Prueba de Inserción
                System.out.println("\n--- PRUEBA 1: INSERCIÓN DE TAREA ---");
                User dev = userRepository.findAll().stream().findFirst().orElse(null);
                TaskType tipo = taskTypeRepository.findAll().stream().findFirst().orElse(null);
                Sprint sprint = sprintRepository.findAll().stream().findFirst().orElse(null);

                if (dev != null && tipo != null) {
                    Task nuevaTarea = new Task();
                    nuevaTarea.setContent("Tarea de prueba: Validar integración con Sprint");
                    nuevaTarea.setEstimatedDuration(3.5f);
                    nuevaTarea.setUser(dev);
                    nuevaTarea.setType(tipo);
                    nuevaTarea.setSprint(sprint); // Puede ser null
                    nuevaTarea.setTaskStatus("Pendiente");
                    nuevaTarea.setIsActive(1);
                    
                    Task guardada = taskRepository.save(nuevaTarea);
                    System.out.println("[ÉXITO] Tarea creada con ID: " + guardada.getTaskId());
                } else {
                    System.out.println("[WARN] No hay datos maestros (User/Type) para crear una tarea.");
                }

                // 3. Prueba de Lectura y Filtrado
                System.out.println("\n--- PRUEBA 2: LECTURA Y FILTRADO JPA ---");
                List<Task> allTasks = taskRepository.findAll();
                
                if (!allTasks.isEmpty()) {
                    System.out.println("[OK] Se encontraron " + allTasks.size() + " tareas en total.");
                    
                    // Usamos la primera tarea para probar relaciones
                    Task sampleTask = allTasks.get(0);
                    User user = sampleTask.getUser();
                    
                    if (user != null) {
                        System.out.println("[INFO] Filtrando tareas para el usuario: " + user.getUsername());
                        List<Task> userTasks = taskRepository.findByUser(user);
                        System.out.println("[OK] El usuario tiene " + userTasks.size() + " tareas asignadas.");
                        
                        // 4. Estadísticas del Equipo
                        if (user.getTeam() != null) {
                            Team equipo = user.getTeam();
                            System.out.println("\n--- PRUEBA 3: ESTADÍSTICAS DE EQUIPO (" + equipo.getName() + ") ---");
                            
                            Float promedioHoras = taskRepository.getAverageWorkedHoursByTeam(equipo.getTeamId());
                            Float promedioFinalizadas = taskRepository.getAverageFinishedTasksByTeam(equipo.getTeamId());
                            Float retrabajo = taskRepository.getReworkRateByTeam(equipo.getTeamId());
                            List<TaskTypeCount> counts = taskRepository.getAllTasksByType(equipo.getTeamId());

                            System.out.println("-> Promedio Horas/Miembro: " + (promedioHoras != null ? promedioHoras : 0.0f));
                            System.out.println("-> Promedio Tareas Finalizadas: " + (promedioFinalizadas != null ? promedioFinalizadas : 0.0f));
                            System.out.println("-> Tasa de Retrabajo: " + (retrabajo != null ? retrabajo : "0.0"));
                            System.out.println("-> Tareas por tipo:");
                            counts.forEach(c -> System.out.println("   - " + c.getTypeName() + ": " + c.getCount()));
                        }
                    }
                } else {
                    System.out.println("[INFO] La tabla de tareas está vacía.");
                }

            } catch (Exception e) {
                System.err.println("\n[ERROR FATAL] La prueba falló:");
                System.err.println("Mensaje: " + e.getMessage());
                e.printStackTrace();
            }

            System.out.println("\n============================================");
            System.out.println("        FIN DE LAS PRUEBAS DE SISTEMA       ");
            System.out.println("============================================\n");
        };
    }
}
