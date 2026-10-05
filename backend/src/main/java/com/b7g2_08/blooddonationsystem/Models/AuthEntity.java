package com.b7g2_08.blooddonationsystem.Models;

import com.b7g2_08.blooddonationsystem.Enums.userType;
import com.b7g2_08.blooddonationsystem.Models.Users.Admin;
import com.b7g2_08.blooddonationsystem.Models.Users.Donor;
import com.b7g2_08.blooddonationsystem.Models.Users.Hospital;
import com.b7g2_08.blooddonationsystem.Models.Users.Hoster;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.ArrayList;
import java.util.List;

@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"
)
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

    @OneToOne(mappedBy = "authEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private Admin admin;
    @OneToOne(mappedBy = "authEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private Donor donor;
    @OneToOne(mappedBy = "authEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private Hospital hospital;
    @OneToOne(mappedBy = "authEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private Hoster hoster;

    @Override
    public boolean isAccountNonExpired() { return true; }

    public Integer getId() { return id;}

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

    // Admins also carry their type as a role (ROLE_SYSADMIN / ROLE_MANAGER / ROLE_DOCTOR) so that
    // @PreAuthorize can tell them apart. Without it every admin endpoint is open to all three.
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + getUserType().name()));
        if (admin != null && admin.getType() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + admin.getType().name()));
        }
        return authorities;
    }

    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin admin) {
        this.admin = admin;
    }

    public Donor getDonor() {
        return donor;
    }

    public void setDonor(Donor donor) {
        this.donor = donor;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }

    public Hoster getHoster() {
        return hoster;
    }

    public void setHoster(Hoster hoster) {
        this.hoster = hoster;
    }
}
