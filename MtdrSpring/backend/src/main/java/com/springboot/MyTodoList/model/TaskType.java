package com.springboot.MyTodoList.model;
import jakarta.persistence.*;

@Entity
@Table(name = "TaskType", schema = "APP_USER")
public class TaskType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long typeId;

    @Column(nullable = false)
    private String name;

    public TaskType() {}

    public Long getTypeId() { return typeId; }
    public void setTypeId(Long typeId) { this.typeId = typeId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
