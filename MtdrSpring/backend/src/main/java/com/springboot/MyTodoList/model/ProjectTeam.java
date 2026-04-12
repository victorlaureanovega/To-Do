package com.springboot.MyTodoList.model;
import jakarta.persistence.*;

@Entity
@Table(name = "PROJECT_TEAM", schema = "APP_USER")
public class ProjectTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectTeamId;

    @ManyToOne
    @JoinColumn(name = "projectId", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "teamId", nullable = false)
    private Team team;

    public ProjectTeam() {}

    // Getters y Setters
    public Long getProjectTeamId() {
        return projectTeamId;
    }

    public void setProjectTeamId(Long projectTeamId) {
        this.projectTeamId = projectTeamId;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }
}
