package com.b7g2_08.blooddonationsystem.DTOs.Auth;

import com.b7g2_08.blooddonationsystem.Enums.adminType;

public class TokenResponse {

    private String token;
    private String role;
    private adminType adminType = null;
    private boolean success = false;
    private String error;

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public adminType getAdminType() {
        return adminType;
    }

    public void setAdminType(adminType adminType) {
        this.adminType = adminType;
    }
}
