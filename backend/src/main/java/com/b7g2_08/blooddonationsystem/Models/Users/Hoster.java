package com.b7g2_08.blooddonationsystem.Models.Users;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
public class Hoster extends User {

    @Column(name = "Organisation")
    private String orgName;

    public String getOrgName() {
        return orgName;
    }
    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }
}
