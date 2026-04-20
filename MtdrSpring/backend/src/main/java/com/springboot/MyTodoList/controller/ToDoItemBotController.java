package com.springboot.MyTodoList.controller;
import com.springboot.MyTodoList.config.BotProps;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.TaskService;
import com.springboot.MyTodoList.service.UserService;
import com.springboot.MyTodoList.util.BotActions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.client.okhttp.OkHttpTelegramClient;
import org.telegram.telegrambots.longpolling.BotSession;
import org.telegram.telegrambots.longpolling.interfaces.LongPollingUpdateConsumer;
import org.telegram.telegrambots.longpolling.starter.AfterBotRegistration;
import org.telegram.telegrambots.longpolling.starter.SpringLongPollingBot;
import org.telegram.telegrambots.longpolling.util.LongPollingSingleThreadUpdateConsumer;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.generics.TelegramClient;

@Component
public class ToDoItemBotController implements SpringLongPollingBot, LongPollingSingleThreadUpdateConsumer {
    private static final Logger logger = LoggerFactory.getLogger(ToDoItemBotController.class);
    
    // Lo quitamos de final para inicializarlo correctamente
    private TelegramClient telegramClient;
    private final BotProps botProps;
    
    @Autowired
    private TaskService taskService;
    @Autowired
    private UserService userService;
    @Autowired
    private DeepSeekService deepSeekService;

    @Value("${telegram.bot.token}")
    private String telegramBotToken;

    public ToDoItemBotController(BotProps bp) {
        this.botProps = bp;
    }

    // Usamos @PostConstruct para asegurar que el token ya existe antes de crear el cliente
    @jakarta.annotation.PostConstruct
    public void init() {
        this.telegramClient = new OkHttpTelegramClient(getBotToken());
    }

    @Override
    public String getBotToken() {
        return (telegramBotToken != null && !telegramBotToken.trim().isEmpty()) 
                ? telegramBotToken : botProps.getToken();
    }

    @Override
    public void consume(Update update) {
        if (!update.hasMessage() || !update.getMessage().hasText()) return;

        String messageTextFromTelegram = update.getMessage().getText();
        long chatId = update.getMessage().getChatId();

        BotActions actions = new BotActions(telegramClient, taskService, userService, deepSeekService);
        actions.setRequestText(messageTextFromTelegram);
        actions.setChatId(chatId);

        actions.fnStart();
        actions.fnListAll();
        actions.fnAddItem();
        actions.fnDone();
        actions.fnUndo();
        actions.fnDelete();
        actions.fnHide();
        actions.fnLLM();
        actions.fnElse();
    }
    
    @Override
    public LongPollingUpdateConsumer getUpdatesConsumer() { return this; }

    @AfterBotRegistration
    public void afterRegistration(BotSession botSession) {
        logger.info("Bot registrado y corriendo: " + botSession.isRunning());
    }
}
