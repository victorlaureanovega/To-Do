package com.springboot.MyTodoList.config;
import com.springboot.MyTodoList.dto.TaskTypeCount;
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
                System.out.println("[OK] JDBC: Conexión establecida con éxito.");

                // --- PRUEBA 1: INSERCIÓN ---
                System.out.println("\n--- PRUEBA 1: INSERCIÓN DE TAREA ---");
                User dev = userRepository.findAll().stream().findFirst().orElse(null);
                TaskType tipo = taskTypeRepository.findAll().stream().findFirst().orElse(null);
                Sprint sprint = sprintRepository.findAll().stream().findFirst().orElse(null);
                
                Task tareaParaEditar = null;

                if (dev != null && tipo != null) {
                    Task nuevaTarea = new Task();
                    nuevaTarea.setContent("Tarea original antes de editar");
                    nuevaTarea.setEstimatedDuration(1.0f);
                    nuevaTarea.setUser(dev);
                    nuevaTarea.setType(tipo);
                    nuevaTarea.setSprint(sprint);
                    nuevaTarea.setTaskStatus("Pendiente");
                    
                    //tareaParaEditar = taskRepository.save(nuevaTarea);
                    //System.out.println("[ÉXITO] Tarea creada para prueba de edición. ID: " + tareaParaEditar.getTaskId());
                }

                // --- PRUEBA: EDICIÓN ---
                System.out.println("\n--- PRUEBA 4: EDICIÓN DE TAREA ---");
                /*
                if (tareaParaEditar != null) {
                    Long id = tareaParaEditar.getTaskId();
                    
                    // Simulamos la edición buscando la tarea de nuevo
                    Task taskExistente = taskRepository.findById(id).get();
                    
                    System.out.println("[INFO] Modificando tarea ID: " + id);
                    taskExistente.setContent("CONTENIDO ACTUALIZADO: " + taskExistente.getContent());
                    taskExistente.setTaskStatus("En curso");
                    taskExistente.setRealDuration(1.5f);
                    
                    Task actualizada = taskRepository.save(taskExistente);
                    
                    System.out.println("[OK] Tarea actualizada correctamente.");
                    System.out.println("     Nuevo Contenido: " + actualizada.getContent());
                    System.out.println("     Nuevo Estado: " + actualizada.getTaskStatus());
                    System.out.println("     Duración Real: " + actualizada.getRealDuration());
                } else {
                    System.out.println("[WARN] No se pudo probar la edición porque no se creó la tarea inicial.");
                }*/

            } catch (Exception e) {
                System.err.println("\n[ERROR FATAL] La prueba falló: " + e.getMessage());
                e.printStackTrace();
            }

            System.out.println("\n============================================");
            System.out.println("        FIN DE LAS PRUEBAS DE SISTEMA       ");
            System.out.println("============================================\n");
        };
    }
}