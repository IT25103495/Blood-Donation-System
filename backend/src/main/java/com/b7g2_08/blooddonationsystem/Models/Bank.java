package com.b7g2_08.blooddonationsystem.Models;

import com.b7g2_08.blooddonationsystem.Models.Users.Admin;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.*;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
public class Bank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bankID;

    @Column(name = "Name")
    private String name;

    @Column(name = "Address")
    private String address;

    @OneToOne
    @JoinColumn(name = "ManagerID", referencedColumnName = "ID")
    @JsonIdentityReference(alwaysAsId = true)
    private Admin manager;

    public Integer getBankID() {
        return bankID;
    }

    public void setBankID(Integer bankID) {
        this.bankID = bankID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Admin getManager() {
        return manager;
    }

    public void setManager(Admin manager) {
        this.manager = manager;
    }
}
