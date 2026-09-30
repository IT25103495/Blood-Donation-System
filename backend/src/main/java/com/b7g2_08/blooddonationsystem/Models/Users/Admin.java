package com.b7g2_08.blooddonationsystem.Models.Users;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import com.b7g2_08.blooddonationsystem.Enums.adminType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
public class Admin extends User {

    @Column(name = "Admin Type")
    //FIXME: Enable this and remake the tables
//    @Enumerated(EnumType.STRING)
    private adminType type;

    public adminType getType() {
        return type;
    }
    public void setType(adminType type) {
        this.type = type;
    }
}
