package com.springboot.MyTodoList.dto;

public class TaskRequestDTO {
    private String content;
    private Float estimatedDuration;
    private Long userId;
    private Long typeId;
    private Long sprintId;

    // Getters y Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Float getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(Float estimatedDuration) { this.estimatedDuration = estimatedDuration; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getTypeId() { return typeId; }
    public void setTypeId(Long typeId) { this.typeId = typeId; }
    public Long getSprintId() { return sprintId; }
    public void setSprintId(Long sprintId) { this.sprintId = sprintId; }
}
