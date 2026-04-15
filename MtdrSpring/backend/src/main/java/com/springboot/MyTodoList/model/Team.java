package com.springboot.MyTodoList.model;
import jakarta.persistence.*;

@Entity
@Table(name = "Team", schema = "APP_USER")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    @Column(nullable = false)
    private String name;

    @Column(name = "managerId")
    private Long managerId;

    public Team() {}

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }
}
