package com.b7g2_08.blooddonationsystem.DesignPattern.User;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import com.b7g2_08.blooddonationsystem.Models.Users.Admin;
import com.b7g2_08.blooddonationsystem.Repos.AuthEntityRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.AdminUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminStrategy implements UserStrategy {
    AdminUserRepository adminRepo;
    AuthEntityRepository authRepo;

    public AdminStrategy(AdminUserRepository adminRepo, AuthEntityRepository authRepo) {
        this.adminRepo = adminRepo;
        this.authRepo = authRepo;
    }

    @Override
    public String delete(int ID) {
        Admin admin = adminRepo.findById(ID).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin Not Found!"));
        authRepo.delete(admin.getAuthEntity());
        return "Admin Deleted";
    }

    @Override
    public User getUser(int ID) {
        return adminRepo.findById(ID).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin Not Found!"));
    }
}
