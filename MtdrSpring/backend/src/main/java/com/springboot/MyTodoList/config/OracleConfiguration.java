package com.springboot.MyTodoList.config;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.User;
import com.springboot.MyTodoList.repository.TaskRepository;
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
    public org.springframework.boot.CommandLineRunner connectionChecker(DataSource ds, TaskRepository taskRepository) {
        return args -> {
            System.out.println("\n--- PRUEBA DE CONEXIÓN Y LECTURA ---");
            
            // 1. Probar Conexión JDBC
            try (java.sql.Connection conn = ds.getConnection()) {
                System.out.println("Conexión JDBC exitosa");
                System.out.println("Usuario: " + conn.getMetaData().getUserName());
                
                // 2. Probar Lectura de Datos (JPA)
                System.out.println("Buscando tareas en APP_USER.TASK...");
                List<Task> tasks = taskRepository.findAll();
                
                if (tasks.isEmpty()) {
                    System.out.println("Conexión OK, pero la tabla está vacía. Verificar INSERTS.");
                } else {
                    System.out.println("LECTURA EXITOSA. Tareas encontradas:");
                    // --- PRUEBA ESPECÍFICA DE FILTRADO POR USUARIO ---
                    System.out.println("\nBuscando por filtro...");
                    
                    // Tomamos el primer usuario que aparezca en las tareas para probar
                    User usuarioDePrueba = tasks.get(1).getUser(); 
                    Long idParaProbar = usuarioDePrueba.getUserId();
                    
                    System.out.println("Buscando tareas para el usuario ID: " + idParaProbar + " (" + usuarioDePrueba.getUsername() + ")");
                    
                    // Aquí es donde probamos el método del repositorio
                    List<Task> tareasFiltradas = taskRepository.findByUser(usuarioDePrueba);
                    
                    System.out.println("Se encontraron " + tareasFiltradas.size() + " tareas para este usuario.");
                    for (Task tf : tareasFiltradas) {
                        System.out.println("   -> Tarea: " + tf.getContent());
                    }
                }
                
            } catch (Exception e) {
                System.err.println("ERROR EN LA PRUEBA:");
                System.err.println("Causa: " + e.getMessage());
                // Si el error dice "Table not found", es probable que el esquema APP_USER no sea el default
                e.printStackTrace();
            }
            
            System.out.println("--- FIN DE LA PRUEBA ---\n");
        };
    }
}