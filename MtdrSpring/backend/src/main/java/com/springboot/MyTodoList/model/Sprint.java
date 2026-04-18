package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "SPRINT", schema = "APP_USER")
public class Sprint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sprintId")
    private Long sprintId;

    @ManyToOne
    @JoinColumn(name = "projectId", nullable = false)
    private Project project;

    // Relación bidireccional (útil para ver tareas desde el sprint)
    @OneToMany(mappedBy = "sprint")
    private List<Task> tasks;

    public Sprint() {}

    // Getters y Setters
    public Long getSprintId() { return sprintId; }
    public void setSprintId(Long sprintId) { this.sprintId = sprintId; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
}
