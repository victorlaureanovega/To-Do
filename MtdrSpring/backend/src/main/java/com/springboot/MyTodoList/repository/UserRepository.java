package com.springboot.MyTodoList.repository;
import com.springboot.MyTodoList.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import jakarta.transaction.Transactional;
import java.util.Optional;

@Repository
@Transactional
@EnableTransactionManagement
public interface UserRepository extends JpaRepository<User, Long> {
    // Para encontrar al usuario cuando mande un mensaje por Telegram
    Optional<User> findByTelegramId(Long telegramId);
    
    // Para el login en el API REST
    Optional<User> findByUsername(String username);
}
