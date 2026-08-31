package com.b7g2_08.blooddonationsystem.Models.Users;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import com.b7g2_08.blooddonationsystem.Abstracts.User;

import java.time.LocalDate;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
public class Donor extends User {
    @Column(name = "First Name")
    private String f_Name;

    @Column(name = "Last Name")
    private String l_Name;

    @Column(name = "NIC")
    private String NIC;

    @Column(name = "Blood Type")
    private String bloodType;

    @Column(name = "Date of Birth")
    private LocalDate dob;

    public String getF_Name() {
        return f_Name;
    }

    public void setF_Name(String f_Name) {
        this.f_Name = f_Name;
    }

    public String getL_Name() {
        return l_Name;
    }

    public void setL_Name(String l_Name) {
        this.l_Name = l_Name;
    }

    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getNIC() {
        return NIC;
    }

    public void setNIC(String NIC) {
        this.NIC = NIC;
    }
}
