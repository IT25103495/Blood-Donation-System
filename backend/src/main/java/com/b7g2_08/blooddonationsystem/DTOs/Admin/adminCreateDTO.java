package com.b7g2_08.blooddonationsystem.DTOs.Admin;

import com.b7g2_08.blooddonationsystem.Enums.adminType;

public class adminCreateDTO {

    protected String email;

    protected String phoneNum;

    protected String username;
    protected String password;

    protected adminType type;

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

    public adminType getType() {
        return type;
    }
}



