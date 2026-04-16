package com.springboot.MyTodoList.dto;

import java.time.LocalDate;

public interface TaskByDate {
    LocalDate getTaskDate();
    Integer getRegistered();
    Integer getCompleted();
}