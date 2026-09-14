package com.b7g2_08.blooddonationsystem.DTOs.Donor;

import java.time.LocalDate;

public class donorCreateDTO {
    protected String f_Name;
    protected String l_Name;
    protected String NIC;
    protected String bloodType;
    protected LocalDate dob;

    protected String email;
    protected String phoneNum;
    protected String username;
    protected String password;

    public String getF_Name() {
        return f_Name;
    }

    public String getL_Name() {
        return l_Name;
    }

    public String getNIC() {
        return NIC;
    }

    public String getBloodType() {
        return bloodType;
    }

    public LocalDate getDob() {
        return dob;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNum() {
        return phoneNum;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
}



