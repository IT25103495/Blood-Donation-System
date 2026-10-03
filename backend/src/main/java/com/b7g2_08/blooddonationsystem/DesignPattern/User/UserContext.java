package com.b7g2_08.blooddonationsystem.DesignPattern.User;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import org.springframework.web.bind.annotation.ResponseBody;

public class UserContext {
    private UserStrategy strategy;

    public void setStrategy(UserStrategy strategy) {
        this.strategy = strategy;
    }

    public @ResponseBody String delete(int ID) {
        if (strategy == null)
            throw new IllegalStateException("No user strategy selected");

        return strategy.delete(ID);
    }

    public @ResponseBody User getUser(int ID) {
        if (strategy == null)
            throw new IllegalStateException("No user strategy selected");
        return strategy.getUser(ID);
    }
}
