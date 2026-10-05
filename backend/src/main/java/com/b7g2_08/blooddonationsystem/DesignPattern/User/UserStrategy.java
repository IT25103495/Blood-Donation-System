package com.b7g2_08.blooddonationsystem.DesignPattern.User;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import jakarta.transaction.Transactional;
import org.springframework.web.bind.annotation.ResponseBody;

public interface UserStrategy {
    @Transactional
    @ResponseBody String delete(int ID);

    @ResponseBody User getUser(int ID);
}
