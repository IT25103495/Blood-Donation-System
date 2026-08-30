package com.b7g2_08.blooddonationsystem.Models;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import com.b7g2_08.blooddonationsystem.Enums.userType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
public class AuthEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    @JsonIgnore
    private String encryptedPW;

    @Enumerated(EnumType.STRING)
    private userType userType;

    @OneToOne(mappedBy = "authEntity")
    private User user;

    @Override
    public boolean isAccountNonExpired() { return true; }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String getPassword() {
        return encryptedPW;
    }

    public void setPassword(String encryptedPW) {
        this.encryptedPW = encryptedPW;
    }

    @Override
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public userType getUserType() {
        return userType;
    }

    public void setUserType(userType userType) {
        this.userType = userType;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + getUserType().name()));
    }

//    public Student getStudent() {
//        return student;
//    }
//
//    public void setStudent(Student student) {
//        this.student = student;
//    }
//
//    public Instructor getInstructor() {
//        return instructor;
//    }
//
//    public void setInstructor(Instructor instructor) {
//        this.instructor = instructor;
//    }
}
