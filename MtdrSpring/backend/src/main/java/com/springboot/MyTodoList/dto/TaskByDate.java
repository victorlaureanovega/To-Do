package com.springboot.MyTodoList.dto;

import java.util.Date;

public interface TaskByDate {
    Date getDate();
    int getRegistered();
    int getCompleted();
}