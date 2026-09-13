package com.b7g2_08.blooddonationsystem.DTOs.Admin;

import com.b7g2_08.blooddonationsystem.Enums.adminType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Id;

import java.time.LocalDate;



public class adminUpdateDTO {
    @Id
    protected int ID;

    @Schema(defaultValue = "noChange")
    protected String email = "noChange";

    @Schema(defaultValue = "noChange")
    protected String phoneNum = "noChange";

    @Schema(defaultValue = "noChange")
    protected String username = "noChange";
    @Schema(defaultValue = "noChange")
    protected String password = "noChange";

    @Schema(defaultValue = "noChange")
    private adminType type;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNum() {
        return phoneNum;
    }

    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public adminType getType() {
        return type;
    }

    public void setType(adminType type) {
        this.type = type;
    }
}
