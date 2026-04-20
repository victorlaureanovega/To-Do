package com.springboot.MyTodoList.model;
import jakarta.persistence.*;

@Entity
@Table(name = "USERS", schema = "APP_USER")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userId")
    private Long userId;

    @Column(name = "telegramId", unique = true, nullable = false)
    private Long telegramId;

    private String username;

    @Column(name = "firstName")
    private String firstName;

    @Column(name = "lastName")
    private String lastName;
    private String role; // 'DEVELOPER' o 'MANAGER'
    private String password;

    @ManyToOne
    @JoinColumn(name = "teamId")
    private Team team;

    public User() {}

    // Getters y Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getTelegramId() { return telegramId; }
    public void setTelegramId(Long telegramId) { this.telegramId = telegramId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
}