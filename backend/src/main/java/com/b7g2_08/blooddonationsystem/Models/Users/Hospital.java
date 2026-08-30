package com.b7g2_08.blooddonationsystem.Models.Users;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
public class Hospital extends User {

    @Column(name = "Address")
    protected String address;

    @Column(name = "Hospital Name")
    protected String hospitalName;

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }
}
