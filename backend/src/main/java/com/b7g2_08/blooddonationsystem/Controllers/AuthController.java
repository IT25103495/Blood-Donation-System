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

    @PreAuthorize("hasRole('SYSADMIN')")
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

    // A sysadmin edits any admin; every other admin may only edit themselves, which the service
    // enforces by ignoring the id they sent.
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(path="/edit/admin")
    public @ResponseBody String edit_admin(@RequestBody adminUpdateDTO user, @AuthenticationPrincipal AuthEntity me) {
        return authService.edit_admin(user, me);
    }

    @PreAuthorize("hasAnyRole('SYSADMIN', 'DONOR')")
    @PutMapping(path="/edit/donor")
    public @ResponseBody String edit_donor(@RequestBody donorUpdateDTO user) {
        return authService.edit_donor(user);
    }

    @PreAuthorize("hasAnyRole('SYSADMIN', 'HOSPITAL')")
    @PutMapping(path="/edit/hospital")
    public @ResponseBody String edit_hospital(@RequestBody hospitalUpdateDTO user) {return authService.edit_hospital(user);}

    @PreAuthorize("hasAnyRole('SYSADMIN', 'HOSTER')")
    @PutMapping(path="/edit/hoster")
    public @ResponseBody String edit_hoster(@RequestBody hosterUpdateDTO user) {return authService.edit_hoster(user);}
    //TODO: Then make delete endpoints (maybe copy my getMe method to delete the current user?)

    // Managers need this to pick the admin who runs a blood bank; the other account lists, and every
    // write, stay with the sysadmin.
    @PreAuthorize("hasAnyRole('SYSADMIN','MANAGER')")
    @GetMapping(path = "/get/adminList")
    public @ResponseBody Iterable<Admin> getAdmins() { return authService.getAdmins();}

    @PreAuthorize("hasRole('SYSADMIN')")
    @GetMapping(path = "/get/donorList")
    public @ResponseBody Iterable<Donor> getDonors() { return authService.getDonors();}

    @PreAuthorize("hasRole('SYSADMIN')")
    @GetMapping(path = "/get/hosterList")
    public @ResponseBody Iterable<Hoster> getHosters() { return authService.getHosters();}

    @PreAuthorize("hasRole('SYSADMIN')")
    @GetMapping(path = "/get/hospitalList")
    public @ResponseBody Iterable<Hospital> getHospitals() { return authService.getHospitals();}

    // /auth/** is permitAll, so without this an anonymous call reaches a null principal.
    @PreAuthorize("isAuthenticated()")
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

    @PreAuthorize("hasRole('SYSADMIN')")
    @GetMapping("/get/user")
    public @ResponseBody User getUser (@RequestParam userType type, @RequestParam int ID) {
        return authService.getUser(type, ID);
    }

    @PreAuthorize("hasRole('SYSADMIN')")
    @DeleteMapping(path = "/delete/user")
    public @ResponseBody String deleteUser(@RequestParam userType type, @RequestParam int ID) {
        return authService.deleteUser(type, ID);
    }
}
