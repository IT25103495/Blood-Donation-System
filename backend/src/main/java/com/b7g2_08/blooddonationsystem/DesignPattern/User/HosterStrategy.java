package com.b7g2_08.blooddonationsystem.DesignPattern.User;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import com.b7g2_08.blooddonationsystem.Models.Users.Hoster;
import com.b7g2_08.blooddonationsystem.Repos.AuthEntityRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.HosterUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class HosterStrategy implements UserStrategy {
    HosterUserRepository hosterRepo;
    AuthEntityRepository authRepo;

    public HosterStrategy(HosterUserRepository hosterRepo, AuthEntityRepository authRepo) {
        this.hosterRepo = hosterRepo;
        this.authRepo = authRepo;
    }

    @Override
    public String delete(int ID) {
        Hoster hoster = hosterRepo.findById(ID).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hoster Not Found!"));
        authRepo.delete(hoster.getAuthEntity());
        return "Hoster Deleted";
    }

    @Override
    public User getUser(int ID) {
        return hosterRepo.findById(ID).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hoster Not Found!"));
    }
}
