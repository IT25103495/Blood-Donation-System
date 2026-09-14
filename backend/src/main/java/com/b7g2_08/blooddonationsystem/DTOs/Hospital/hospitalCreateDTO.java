package com.b7g2_08.blooddonationsystem.DTOs.Hospital;

public class hospitalCreateDTO {
    protected String hospitalName;
    protected String address;

    protected String email;
    protected String phoneNum;
    protected String username;
    protected String password;

    public String getAddress() {
        return address;
    }

    public String getHospitalName() {
        return hospitalName;
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
