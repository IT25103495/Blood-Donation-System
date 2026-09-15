package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Admin.adminCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Auth.TokenResponse;
import com.b7g2_08.blooddonationsystem.DTOs.Auth.authLoginDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Donor.donorCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Hospital.hospitalCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Hoster.hosterCreateDTO;
import com.b7g2_08.blooddonationsystem.Models.Users.Admin;
import com.b7g2_08.blooddonationsystem.Services.AuthService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path="/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping(path="/login") // Map ONLY POST Requests
    public @ResponseBody TokenResponse login(@RequestBody authLoginDTO user) {
        return authService.login(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(path="/register/admin")
    public @ResponseBody String register_admin(@RequestBody adminCreateDTO user) {
        return authService.register_admin(user);
    }

    @PostMapping(path="/register/donor")
    public @ResponseBody String register_donor(@RequestBody donorCreateDTO user) {
        return authService.register_donor(user);
    }
    @PostMapping(path="/register/hospital")
    public @ResponseBody String register_hospital(@RequestBody hospitalCreateDTO user) {
        return authService.register_hospital(user);
    }
    @PostMapping(path="/register/hoster")
    public @ResponseBody String register_hoster(@RequestBody hosterCreateDTO user) {
        return authService.register_hoster(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(path = "/get/adminList")
    public @ResponseBody Iterable<Admin> getAdmins() { return authService.getAdmins();}
}
