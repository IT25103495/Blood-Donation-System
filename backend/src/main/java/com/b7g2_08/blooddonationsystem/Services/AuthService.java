package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.Auth.JwtUtil;
import com.b7g2_08.blooddonationsystem.DTOs.Admin.adminCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Auth.TokenResponse;
import com.b7g2_08.blooddonationsystem.DTOs.Auth.authLoginDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Donor.donorCreateDTO;
import com.b7g2_08.blooddonationsystem.Enums.userType;
import com.b7g2_08.blooddonationsystem.Models.AuthEntity;
import com.b7g2_08.blooddonationsystem.Models.Users.Admin;
import com.b7g2_08.blooddonationsystem.Models.Users.Donor;
import com.b7g2_08.blooddonationsystem.Repos.AuthEntityRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.AdminUserRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.DonorUserRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.HospitalUserRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.HosterUserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    AuthEntityRepository authRepo;
    @Autowired
    AdminUserRepository adminRepo;
    @Autowired
    DonorUserRepository donorRepo;
    @Autowired
    HospitalUserRepository hospitalRepo;
    @Autowired
    HosterUserRepository hosterRepo;
    @Autowired
    JwtUtil jwtUtil;
    @Autowired
    PasswordEncoder encoder;

    @Transactional
    public TokenResponse login(authLoginDTO request) {
        TokenResponse token = new TokenResponse();

        //Verify user is in DB
        Optional<AuthEntity> opAuth = authRepo.findByUsername(request.getUsername());
        if (opAuth.isEmpty() ||
                !encoder.matches(request.getPassword(), opAuth.get().getPassword())) {

            token.setSuccess(false);
            token.setError("Invalid Username or Password");
        }
        else {
            token.setToken(jwtUtil.generateToken(opAuth.get().getUsername()));
            token.setSuccess(true);
            token.setRole(opAuth.get().getUserType().name());
        }

        return token;
    }

    @Transactional
    public @ResponseBody String register_admin(adminCreateDTO _user) {
        String phoneNum = _user.getPhoneNum();
        if (phoneNum == null || !phoneNum.matches("\\d{10}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phone number must be exactly 10 digits"
            );
        }

        Admin user = new Admin();
        AuthEntity auth = new AuthEntity();

        user.setPhoneNum(_user.getPhoneNum());
        user.setType(_user.getType());
        user.setAuthEntity(auth);

        auth.setUsername(_user.getUsername());
        auth.setPassword(encoder.encode(_user.getPassword()));
        auth.setEmail(_user.getEmail());
        auth.setUserType(userType.ADMIN);

        authRepo.save(auth);
        adminRepo.save(user);
        return "Registered";
    }

    @Transactional
    public @ResponseBody String register_donor(donorCreateDTO _user) {
        String phoneNum = _user.getPhoneNum();
        if (phoneNum == null || !phoneNum.matches("\\d{10}")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phone number must be exactly 10 digits"
            );
        }

        Donor user = new Donor();
        AuthEntity auth = new AuthEntity();

        user.setF_Name(_user.getF_Name());
        user.setL_Name(_user.getL_Name());
        user.setNIC(_user.getNIC());
        user.setBloodType(_user.getBloodType());
        user.setDob(_user.getDob());
        user.setPhoneNum(_user.getPhoneNum());
        user.setAuthEntity(auth);

        auth.setUsername(_user.getUsername());
        auth.setPassword(encoder.encode(_user.getPassword()));
        auth.setEmail(_user.getEmail());
        auth.setUserType(userType.DONOR);

        authRepo.save(auth);
        donorRepo.save(user);
        return "Registered";
    }
}
