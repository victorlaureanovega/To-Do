package com.springboot.MyTodoList.repository;
import com.springboot.MyTodoList.model.ProjectTeam;
import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Long> {
    // Para saber qué equipos están en un proyecto
    List<ProjectTeam> findByProject(Project project);
    
    // Para saber en qué proyectos participa un equipo
    List<ProjectTeam> findByTeam(Team team);
}
