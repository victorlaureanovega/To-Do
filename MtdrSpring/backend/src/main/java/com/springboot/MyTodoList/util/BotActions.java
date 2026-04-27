package com.springboot.MyTodoList.util;
import com.springboot.MyTodoList.model.*;
import com.springboot.MyTodoList.service.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

//import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;

public class BotActions {
    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);

    String requestText;
    long chatId;
    TelegramClient telegramClient;
    boolean exit = false;

    TaskService taskService;
    UserService userService;
    DeepSeekService deepSeekService;

    public BotActions(TelegramClient tc, TaskService ts, UserService us, DeepSeekService ds) {
        telegramClient = tc;
        taskService = ts;
        userService = us;
        deepSeekService = ds;
    }

    public void setRequestText(String cmd) {
        this.requestText = cmd;
    }
    
    public void setChatId(long chId) {
        this.chatId = chId;
    }

    public void setTelegramClient(TelegramClient tc){
        telegramClient=tc;
    }

    public void setTodoService(TaskService tsvc){
        taskService = tsvc;
    }

    public TaskService getTodoService(){
        return taskService;
    }

    public void setDeepSeekService(DeepSeekService dssvc){
        deepSeekService = dssvc;
    }

    public DeepSeekService getDeepSeekService(){
        return deepSeekService;
    }

    public void fnStart() {
        // Si el mensaje no es /start o el texto de volver, no hacemos nada
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand()) || 
            requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) || exit) 
            return;

        // Construimos el teclado
        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
            .keyboardRow(new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel(), BotLabels.ADD_NEW_ITEM.getLabel()))
            .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel(), BotLabels.HIDE_MAIN_SCREEN.getLabel()))
            .resizeKeyboard(true)
            .oneTimeKeyboard(false)
            .build();

        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient, keyboardMarkup);
        
        exit = true;
    }

    public void fnDone() {
        if (!requestText.contains(BotLabels.DONE.getLabel()) || exit) return;
        
        try {
            Long id = Long.valueOf(requestText.split(BotLabels.DASH.getLabel())[0]);
            taskService.findById(id).ifPresent(task -> {
                task.setTaskStatus("Finalizada");
                task.setEverFinished(1);
                task.setFinishDate(new java.sql.Date(System.currentTimeMillis()));
                taskService.save(task);

                String mensaje = "Item done! \nHow many hours did it take you? \n\n" +
                                "Answer with: " + id + " / [hours]";
                BotHelper.sendMessageToTelegram(chatId, mensaje, telegramClient);
            });
        } catch (Exception e) {
            logger.error("Error en fnDone: " + e.getMessage());
        }
        exit = true;
    }

    public void fnUndo() {
        if (exit || !requestText.contains(BotLabels.UNDO.getLabel())) 
            return;

        try {
            // Extraemos el ID usando el guion como separador
            String undoIdPart = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel())).trim();
            Long id = Long.valueOf(undoIdPart);

            taskService.findById(id).ifPresent(task -> {
                task.setTaskStatus("En curso");
                task.setFinishDate(null);
                
                taskService.save(task);
                
                BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), telegramClient);
            });

        } catch (Exception e) {
            logger.error("Error en fnUndo: " + e.getMessage());
        }
        
        exit = true;
    }

    public void fnDelete(){
        if (requestText.indexOf(BotLabels.DELETE.getLabel()) == -1 || exit)
            return;

        try {
            String delete = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
            Long id = Long.valueOf(delete); 

            taskService.deleteById(id);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), telegramClient);

        } catch (Exception e) {
            logger.error("Error en borrar tarea: " + e.getMessage());
        }

        exit = true;
    }

    public void fnHide(){
        if (requestText.equals(BotCommands.HIDE_COMMAND.getCommand())
				|| requestText.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel()) && !exit)
			BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), telegramClient);
        else
            return;

        exit = true;
    }

    public void fnListAll() {
        if (!(requestText.equals(BotCommands.TODO_LIST.getCommand()) || requestText.equals(BotLabels.LIST_ALL_ITEMS.getLabel())) || exit)
            return;

        List<Task> allTasks = taskService.findByTelegramId(chatId);
        
        List<KeyboardRow> keyboard = new ArrayList<>();
        keyboard.add(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel()));
        keyboard.add(new KeyboardRow(BotLabels.ADD_NEW_ITEM.getLabel()));

        // Tareas Pendientes / En curso
        allTasks.stream()
        /*
            .filter(t -> !"Finalizada".equals(t.getTaskStatus()))
            .forEach(t -> {
                KeyboardRow row = new KeyboardRow();
                row.add(t.getContent());
                row.add(t.getTaskId() + BotLabels.DASH.getLabel() + BotLabels.DONE.getLabel());
                keyboard.add(row);
            });*/
            .filter(t -> !"Finalizada".equals(t.getTaskStatus()))
            .forEach(t -> {
                KeyboardRow row = new KeyboardRow();
                row.add(t.getContent());
                // Botón para finalizar
                row.add(t.getTaskId() + BotLabels.DASH.getLabel() + BotLabels.DONE.getLabel());
                // Botón para cambiar estado
                row.add(t.getTaskId() + BotLabels.STATUS_SEP.getLabel() + BotLabels.CHANGE_STATUS.getLabel());
                keyboard.add(row);
            });

        ReplyKeyboardMarkup markup = ReplyKeyboardMarkup.builder()
            .keyboard(keyboard)
            .resizeKeyboard(true)
            .build();

        BotHelper.sendMessageToTelegram(chatId, BotLabels.MY_TODO_LIST.getLabel(), telegramClient, markup);
        exit = true;
    }

    public void fnAddItem() {
        if (exit) return;

        // Verificamos si el mensaje es el comando o el label del botón
        if (!(requestText.contains(BotCommands.ADD_ITEM.getCommand()) || 
            requestText.contains(BotLabels.ADD_NEW_ITEM.getLabel()))) {
            return;
        }

        logger.info("Bot solicita al usuario escribir una nueva tarea");
        
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_NEW_TODO_ITEM.getMessage(), telegramClient);
        
        exit = true; 
    }

    public void fnChangeStatus() {
        if (!requestText.contains(BotLabels.CHANGE_STATUS.getLabel()) || exit) return;

        try {
            // Extraer el ID antes del @
            Long id = Long.valueOf(requestText.split(BotLabels.STATUS_SEP.getLabel())[0]);
            
            // Crear un teclado temporal para elegir el estado
            ReplyKeyboardMarkup statusKeyboard = ReplyKeyboardMarkup.builder()
                .keyboardRow(new KeyboardRow(id + " @ Pendiente", id + " @ En curso"))
                .keyboardRow(new KeyboardRow(BotLabels.SHOW_MAIN_SCREEN.getLabel()))
                .resizeKeyboard(true)
                .build();

            BotHelper.sendMessageToTelegram(chatId, "Select the new status for task " + id + ":", telegramClient, statusKeyboard);
        } catch (Exception e) {
            logger.error("Error in fnChangeStatus: " + e.getMessage());
        }
        exit = true;
    }
    
    public void fnElse() {
        if (exit) return;

        // Filtro de seguridad para no guardar botones como tareas
        if (isCommandOrLabel(requestText)) return;

        // Duración real (finalización de tareas)
        if (requestText.contains("/")) {
            String[] parts = requestText.split("/");
            // Ver si la primera parte es un ID de tarea existente
            try {
                Long potentialId = Long.parseLong(parts[0].trim());
                Float hours = Float.parseFloat(parts[1].trim());

                Optional<Task> taskOpt = taskService.findById(potentialId);
                if (taskOpt.isPresent() && "Finalizada".equals(taskOpt.get().getTaskStatus())) {
                    Task task = taskOpt.get();
                    task.setRealDuration(hours);
                    task.setTotalHoursWorked(hours.doubleValue()); // O sumar si ya tenía algo
                    taskService.save(task);

                    BotHelper.sendMessageToTelegram(chatId, "Registered time " + hours + " hrs. Well done!\nSelect /todolist to return to the list of todo items, or /start to go to the main screen.", telegramClient);
                    exit = true;
                    return;
                }
            } catch (Exception e) {
                // Si falla, no era un registro de tiempo, seguimos con la creación de tarea normal
            }
        }

        if (requestText.contains(BotLabels.STATUS_SEP.getLabel()) && !requestText.contains(BotLabels.CHANGE_STATUS.getLabel())) {
            try {
                String[] parts = requestText.split(BotLabels.STATUS_SEP.getLabel());
                Long id = Long.parseLong(parts[0].trim());
                String newStatus = parts[1].trim();

                taskService.findById(id).ifPresent(task -> {
                    task.setTaskStatus(newStatus);
                    
                    // Lógica extra si se marca como finalizada desde aquí
                    /*
                    if ("Finalizada".equalsIgnoreCase(newStatus)) {
                        task.setEverFinished(1);
                        task.setFinishDate(new java.sql.Date(System.currentTimeMillis()));
                        BotHelper.sendMessageToTelegram(chatId, "Task #" + id + " marked as Finalizada. \nDon't forget to register your time with: " + id + " / [hours]", telegramClient);
                    } else {
                        BotHelper.sendMessageToTelegram(chatId, "Status updated to: " + newStatus, telegramClient);
                    }*/
                    BotHelper.sendMessageToTelegram(chatId, "Task " + task.getTaskId() + " status updated to: " + newStatus, telegramClient);
                    
                    taskService.save(task);
                });
                exit = true;
                return;
            } catch (Exception e) {
                logger.error("Error processing status change: " + e.getMessage());
            }
        }
    
        // Creación de tareas
        userService.findByTelegramId(chatId).ifPresentOrElse(user -> {
            try {
                Task newTask = new Task();
                newTask.setUser(user);
                newTask.setTaskStatus("Pendiente");
                newTask.setIsActive(1);
                newTask.setEverFinished(0);

                // Separar por el carácter '/'
                String[] parts = requestText.split("/");

                if (parts.length >= 1) {
                    // Parte 1: Contenido (limpiar espacios extras)
                    newTask.setContent(parts[0].trim());
                }

                // Parte 2: Duración estimada (si existe)
                if (parts.length >= 2) {
                    try {
                        newTask.setEstimatedDuration(Float.parseFloat(parts[1].trim()));
                    } catch (NumberFormatException e) {
                        logger.warn("Formato de duración inválido, usando 0");
                        newTask.setEstimatedDuration(0f);
                    }
                } else {
                    newTask.setEstimatedDuration(0f);
                }

                // Parte 3: Tipo de tarea (si existe)
                if (parts.length >= 3) {
                    String typeName = parts[2].trim();
                    // Buscar el tipo por nombre en la DB
                    taskService.findTypeByName(typeName).ifPresentOrElse(
                        newTask::setType,
                        () -> newTask.setType(taskService.getDefaultType())
                    );
                } else {
                    newTask.setType(taskService.getDefaultType());
                }

                // Guardado final
                if (newTask.getType() == null) {
                    BotHelper.sendMessageToTelegram(chatId, "Error: No hay tipos de tarea configurados.", telegramClient);
                    return;
                }

                taskService.save(newTask);
                BotHelper.sendMessageToTelegram(chatId, BotMessages.NEW_ITEM_ADDED.getMessage(), telegramClient);

            } catch (Exception e) {
                logger.error("Error al guardar: " + e.getMessage());
                BotHelper.sendMessageToTelegram(chatId, "Error técnico al guardar. Revisa el formato.", telegramClient);
            }
        }, () -> {
            BotHelper.sendMessageToTelegram(chatId, "No registrado. ID: " + chatId, telegramClient);
        });

        exit = true;
    }

    // Método auxiliar para evitar que los labels se guarden
    private boolean isCommandOrLabel(String text) {
        return text.equals(BotLabels.ADD_NEW_ITEM.getLabel()) ||
            text.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel()) ||
            text.equals(BotLabels.LIST_ALL_ITEMS.getLabel()) ||
            text.startsWith("/");
    }

    public void fnLLM(){
        logger.info("Calling LLM");
        if (!(requestText.contains(BotCommands.LLM_REQ.getCommand())) || exit)
            return;
        
        String prompt = "Dame los datos del clima en mty";
        String out = "<empty>";
        try{
            out = deepSeekService.generateText(prompt);
        }catch(Exception exc){

        }

        BotHelper.sendMessageToTelegram(chatId, "LLM: "+out, telegramClient, null);
    }
}
