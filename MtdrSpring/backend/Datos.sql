-- Datos iniciales de prueba (puede que sea necesario ejecutar antes: ALTER USER APP_USER QUOTA UNLIMITED ON DATA;)

-- Tipos de tareas
INSERT INTO APP_USER.TaskType (name) VALUES ('Feature');
INSERT INTO APP_USER.TaskType (name) VALUES ('Bug');
INSERT INTO APP_USER.TaskType (name) VALUES ('Research');
INSERT INTO APP_USER.TaskType (name) VALUES ('Documentation');

-- Equipos
INSERT INTO APP_USER.Team (name) VALUES ('Equipo 15');

-- Usuarios
INSERT INTO APP_USER.Users (telegramId, username, firstName, lastName, role, teamId) 
    VALUES (123456789, 'psong_dev', 'Pablo', 'Song', 'DEVELOPER', 1);

INSERT INTO APP_USER.Users (telegramId, username, firstName, lastName, role, teamId) 
    VALUES (123456788, 'eugenio_dev', 'Eugenio', 'Guzmán', 'DEVELOPER', 1);

INSERT INTO APP_USER.Users (telegramId, username, firstName, lastName, role, teamId) 
    VALUES (987654321, 'victor_dev', 'Víctor', 'Laureano', 'DEVELOPER', 1);

INSERT INTO APP_USER.Users (telegramId, username, firstName, lastName, role, teamId) 
    VALUES (123451234, 'salvador_dev', 'Salvador', 'Bravo', 'DEVELOPER', 1);

INSERT INTO APP_USER.Users (telegramId, username, firstName, lastName, role, teamId) 
    VALUES (678956789, 'mariano_dev', 'Mariano', 'Sánchez', 'DEVELOPER', 1);

INSERT INTO APP_USER.Users (telegramId, username, firstName, lastName, role, teamId) 
    VALUES (121212121, 'karen_dev', 'Karen', 'Mariel', 'DEVELOPER', 1);


-- Tareas
INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (1, 1, 'Probar conexión con Oracle y Spring Boot', 'Pendiente', 1.0, 1.0, 1, 0, CURRENT_DATE, NULL);

-- Víctor - 8
INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (8, 1, 'Hacer la endpoint para obtener las tareas de un desarrollador específico', 'En curso', 0.5, 1.5, 1, 0, CURRENT_DATE, NULL);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, estimatedDuration, realDuration, totalHoursWorked, isActive, everFinished, creationDate, finishDate) 
    VALUES (8, 1, 'Hacer la endpoint para obtener el promedio de horas trabajadas por un equipo', 'Finalizada', 2.0, 2.2, 2.2, 1, 1, CURRENT_DATE - 1, CURRENT_DATE);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (8, 1, 'Implementar las primeras versiones de los repositorios, controladores y servicios del backend', 'Finalizada', 2.0, 2.5, 1, 1, CURRENT_DATE - 1, CURRENT_DATE);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (8, 1, 'Sprint 1, Java', 'Finalizada', 2.5, 3.0, 1, 1, CURRENT_DATE - 2, CURRENT_DATE);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (8, 1, 'Crear la nueva base de datos en Oracle Autonomous Database', 'Finalizada', 1.0, 1.5, 1, 1, CURRENT_DATE - 1, CURRENT_DATE);

-- Nueva tarea para Víctor (userId=8)
INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, estimatedDuration, realDuration, totalHoursWorked, isActive, everFinished, creationDate, finishDate) 
    VALUES (8, 1, 'Crear endpoint para obtener la tasa de retrabajo de un equipo', 'En curso', 3.0, 0.0, 1.2, 1, 0, CURRENT_DATE, NULL);

-- Salvador - 9
INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (9, 1, 'Hacer la endpoint para obtener las horas trabajadas por cada desarrollador', 'En curso', 1.5, 3.0, 1, 0, CURRENT_DATE, NULL);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (9, 1, 'Sprint 1, Linux', 'Finalizada', 1.5, 1.5, 1, 1, CURRENT_DATE - 1, CURRENT_DATE);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (9, 1, 'Hacer la endpoint para obtener el promedio de tareas realizadas por cada miembro de un equipo', 'Pendiente', 0.0, 2.5, 1, 0, CURRENT_DATE, NULL);

-- Mariano - 10
INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (10, 1, 'Hacer mock-up del frontend en React', 'Finalizada', 2.0, 2.0, 1, 1, CURRENT_DATE - 1, CURRENT_DATE);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (10, 1, 'Sprint 1, Bases de datos', 'Finalizada', 3.0, 3.5, 1, 1, CURRENT_DATE - 2, CURRENT_DATE);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (10, 3, 'Investigar una librería para hacer gráficas en React', 'Finalizada', 1.0, 1.0, 1, 1, CURRENT_DATE - 1, CURRENT_DATE);

-- Karen - 11
INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (11, 1, 'Sprint 1, Administración de Proyectos', 'Finalizada', 2.0, 2.0, 1, 1, CURRENT_DATE - 1, CURRENT_DATE);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (11, 1, 'Sprint 1, Requerimientos de software', 'Finalizada', 0.5, 1.0, 1, 1, CURRENT_DATE - 1, CURRENT_DATE);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (11, 1, 'Hacer ajustes de las gráficas y vistas del frontend de acuerdo con los nuevos planes para el proyecto', 'En curso', 2.0, 4.0, 1, 0, CURRENT_DATE, NULL);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (11, 1, 'Revisar el esquema de la base de datos y definir columnas que sea necesario añadir', 'Finalizada', 1.0, 1.5, 1, 1, CURRENT_DATE - 1, CURRENT_DATE);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (11, 3, 'Hacer la conexión entre el backend y el frontend', 'En curso', 3.0, 5.0, 1, 0, CURRENT_DATE, NULL);

-- Eugenio - 13
INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, totalHoursWorked, estimatedDuration, isActive, everFinished, creationDate, finishDate) 
    VALUES (13, 1, 'Sprint 1, Diseño y arquitectura', 'Finalizada', 4.0, 4.0, 1, 1, CURRENT_DATE - 3, CURRENT_DATE);

-- Nueva tarea para Eugenio (userId=13)
INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, estimatedDuration, realDuration, totalHoursWorked, isActive, everFinished, creationDate, finishDate) 
    VALUES (13, 1, 'Mejorar la interfaz del frontend', 'Pendiente', 4.5, 0.0, 0.0, 1, 0, CURRENT_DATE, NULL);

COMMIT;