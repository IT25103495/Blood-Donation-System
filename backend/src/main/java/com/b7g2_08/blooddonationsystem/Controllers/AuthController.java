package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import com.b7g2_08.blooddonationsystem.DTOs.Admin.adminCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Admin.adminUpdateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Auth.TokenResponse;
import com.b7g2_08.blooddonationsystem.DTOs.Auth.authLoginDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Donor.donorCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Donor.donorUpdateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Hospital.hospitalCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Hospital.hospitalUpdateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Hoster.hosterCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Hoster.hosterUpdateDTO;
import com.b7g2_08.blooddonationsystem.Enums.userType;
import com.b7g2_08.blooddonationsystem.Models.AuthEntity;
import com.b7g2_08.blooddonationsystem.Models.Users.Admin;
import com.b7g2_08.blooddonationsystem.Models.Users.Donor;
import com.b7g2_08.blooddonationsystem.Models.Users.Hospital;
import com.b7g2_08.blooddonationsystem.Models.Users.Hoster;
import com.b7g2_08.blooddonationsystem.Services.AuthService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path="/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
//    @Autowired
//    private AdminUserRepository adminUserRepository;
//    @Autowired
//    private DonorUserRepository donorUserRepository;
//    @Autowired
//    private HospitalUserRepository hospitalUserRepository;
//    @Autowired
//    private HosterUserRepository hosterUserRepository;

    @PostMapping(path="/login") // Map ONLY POST Requests
    public @ResponseBody TokenResponse login(@RequestBody authLoginDTO user) {
        return authService.login(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(path="/register/admin")
    public @ResponseBody String register_admin(@RequestBody adminCreateDTO user) {
        return authService.register_admin(user);
    }

    //Not to be included in production
    //ideally this path will be filtered in network security
    @PostMapping(path="/debug/registerAdmin")
    public @ResponseBody String register_admin_debug(@RequestBody adminCreateDTO user) {
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
    @PutMapping(path="/edit/admin")
    public @ResponseBody String edit_admin(@RequestBody adminUpdateDTO user) {
        return authService.edit_admin(user);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DONOR')")
    @PutMapping(path="/edit/donor")
    public @ResponseBody String edit_donor(@RequestBody donorUpdateDTO user) {
        return authService.edit_donor(user);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HOSPITAL')")
    @PutMapping(path="/edit/hospital")
    public @ResponseBody String edit_hospital(@RequestBody hospitalUpdateDTO user) {return authService.edit_hospital(user);}

    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTER')")
    @PutMapping(path="/edit/hoster")
    public @ResponseBody String edit_hoster(@RequestBody hosterUpdateDTO user) {return authService.edit_hoster(user);}
    //TODO: Then make delete endpoints (maybe copy my getMe method to delete the current user?)

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(path = "/get/adminList")
    public @ResponseBody Iterable<Admin> getAdmins() { return authService.getAdmins();}

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(path = "/get/donorList")
    public @ResponseBody Iterable<Donor> getDonors() { return authService.getDonors();}

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(path = "/get/hosterList")
    public @ResponseBody Iterable<Hoster> getHosters() { return authService.getHosters();}

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(path = "/get/hospitalList")
    public @ResponseBody Iterable<Hospital> getHospitals() { return authService.getHospitals();}

    @GetMapping(path = "/get/me")
    public @ResponseBody User getMe(@AuthenticationPrincipal AuthEntity me) {
        switch(me.getUserType()) {
            case userType.ADMIN -> {return me.getAdmin();}
            case userType.DONOR -> {return me.getDonor();}
            case userType.HOSPITAL -> {return me.getHospital();}
            case userType.HOSTER -> {return me.getHoster();}
            default -> {return null;}
        }
    }

    @DeleteMapping(path = "/delete/me")
    public @ResponseBody String deleteMe(@AuthenticationPrincipal AuthEntity me) {return authService.deleteMe(me);}

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/get/user")
    public @ResponseBody User getUser (@RequestParam userType type, @RequestParam int ID) {
        return authService.getUser(type, ID);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping(path = "/delete/user")
    public @ResponseBody String deleteUser(@RequestParam userType type, @RequestParam int ID) {
        return authService.deleteUser(type, ID);
    }
}
