package com.b7g2_08.blooddonationsystem.DesignPattern.User;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import com.b7g2_08.blooddonationsystem.Models.Users.Hospital;
import com.b7g2_08.blooddonationsystem.Repos.AuthEntityRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.HospitalUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class HospitalStrategy implements UserStrategy {
    HospitalUserRepository hospitalRepo;
    AuthEntityRepository authRepo;

    public HospitalStrategy(HospitalUserRepository hospitalRepo, AuthEntityRepository authRepo) {
        this.hospitalRepo = hospitalRepo;
        this.authRepo = authRepo;
    }

    @Override
    public String delete(int ID) {
        Hospital hospital = hospitalRepo.findById(ID).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital Not Found!"));
        authRepo.delete(hospital.getAuthEntity());
        return "Hospital Deleted";
    }

    @Override
    public User getUser(int ID) {
        return hospitalRepo.findById(ID).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital Not Found!"));
    }
}
