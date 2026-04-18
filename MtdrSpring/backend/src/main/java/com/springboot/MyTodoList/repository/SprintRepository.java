package com.springboot.MyTodoList.repository;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    // Buscar todos los sprints de un proyecto específico
    List<Sprint> findByProject(Project project);
    
    // Buscar sprints por el ID del proyecto directamente
    List<Sprint> findByProject_ProjectId(Long projectId);
}
