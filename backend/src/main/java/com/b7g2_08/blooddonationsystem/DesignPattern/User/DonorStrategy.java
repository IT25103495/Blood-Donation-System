package com.b7g2_08.blooddonationsystem.DesignPattern.User;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import com.b7g2_08.blooddonationsystem.Models.Users.Donor;
import com.b7g2_08.blooddonationsystem.Repos.AuthEntityRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.DonorUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DonorStrategy implements UserStrategy {
    DonorUserRepository donorRepo;
    AuthEntityRepository authRepo;

    public DonorStrategy(DonorUserRepository donorRepo, AuthEntityRepository authRepo) {
        this.donorRepo = donorRepo;
        this.authRepo = authRepo;
    }

    @Override
    public String delete(int ID) {
        Donor donor = donorRepo.findById(ID).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor Not Found!"));
        authRepo.delete(donor.getAuthEntity());
        return "Donor Deleted";
    }

    @Override
    public User getUser(int ID) {
        return donorRepo.findById(ID).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor Not Found!"));
    }

}
