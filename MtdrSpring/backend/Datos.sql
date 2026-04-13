-- Datos iniciales de prueba (puede que sea necesario ejecutar antes: ALTER USER APP_USER QUOTA UNLIMITED ON DATA;)
INSERT INTO APP_USER.TaskType (name) VALUES ('Feature');

INSERT INTO APP_USER.Team (name) VALUES ('Backend Developers');

INSERT INTO APP_USER.Users (telegramId, username, firstName, lastName, role, teamId) 
    VALUES (123456789, 'psong_dev', 'Pablo', 'Song', 'DEVELOPER', 1);

INSERT INTO APP_USER.Task (userId, typeId, content, taskStatus, estimatedDuration) 
    VALUES (1, 1, 'Probar conexión con Oracle y Spring Boot', 'Pendiente', 2.5);

COMMIT;