package com.springboot.MyTodoList.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TASK", schema = "APP_USER")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taskId;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "typeId", nullable = false)
    private TaskType type;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(name = "taskStatus")
    private String taskStatus = "Pendiente";

    @Column(name = "everFinished")
    private Integer everFinished = 0;

    @Column(name = "creationDate", updatable = false)
    private LocalDateTime creationDate = LocalDateTime.now();

    private Float estimatedDuration;
    private java.sql.Date finishDate;
    private Float realDuration;
    private Double totalHoursWorked = 0.0;
    private Integer isActive = 1;

    public Task() {}

    // Getters y Setters
    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public TaskType getType() { return type; }
    public void setType(TaskType type) { this.type = type; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getTaskStatus() { return taskStatus; }
    public void setTaskStatus(String taskStatus) { this.taskStatus = taskStatus; }
    public Integer getIsActive() { return isActive; }
    public void setIsActive(Integer isActive) { this.isActive = isActive; }
}
