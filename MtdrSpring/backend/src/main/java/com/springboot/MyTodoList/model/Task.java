package com.springboot.MyTodoList.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TASK", schema = "APP_USER")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "taskId")
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

    @Column(name = "estimatedDuration")
    private Float estimatedDuration;

    @Column(name = "finishDate")
    private java.sql.Date finishDate;

    @Column(name = "realDuration")
    private Float realDuration;

    @Column(name = "totalHoursWorked")
    private Double totalHoursWorked = 0.0;

    @Column(name = "isActive")
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

    public Integer getEverFinished() { return everFinished; }
    public void setEverFinished(Integer everFinished) { this.everFinished = everFinished; }

    public LocalDateTime getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDateTime creationDate) { this.creationDate = creationDate; }

    public Float getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(Float estimatedDuration) { this.estimatedDuration = estimatedDuration; }

    public java.sql.Date getFinishDate() { return finishDate; }
    public void setFinishDate(java.sql.Date finishDate) { this.finishDate = finishDate; }

    public Float getRealDuration() { return realDuration; }
    public void setRealDuration(Float realDuration) { this.realDuration = realDuration; }

    public Double getTotalHoursWorked() { return totalHoursWorked; }
    public void setTotalHoursWorked(Double totalHoursWorked) { this.totalHoursWorked = totalHoursWorked; }
}
