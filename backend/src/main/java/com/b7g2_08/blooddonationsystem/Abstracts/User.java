package com.b7g2_08.blooddonationsystem.Abstracts;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.b7g2_08.blooddonationsystem.Models.AuthEntity;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;

@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "ID"
)
@MappedSuperclass
public abstract class User {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    protected Integer ID;

//    @Column(name = "Full Name")
//    protected String fullName;

//    @Column(name = "Date of Birth")
//    protected LocalDate dob;

    @Column(name = "Phone Number")
    protected String phoneNum;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "authID", referencedColumnName = "id", nullable = false)
    //FIXME: Used to be name = "authId", fix if broken
    private AuthEntity authEntity;

    public Integer getID() {
        return ID;
    }
//    public String getFullName() {
//        return fullName;
//    }
//    public LocalDate getDob() {
//        return dob;
//    }
    public String getPhoneNum() {
        return phoneNum;
    }
    public AuthEntity getAuthEntity() {return authEntity;}

    //TODO: Make note of how you can run functions to get authentity details in a protected context through getters in user subclasses
    @JsonProperty("username")
    public String getUsername() {
        return authEntity != null ? authEntity.getUsername() : null;
    }

    public void setID(Integer ID) {
        this.ID = ID;
    }
//    public void setFullName(String fullName) {
//        this.fullName = fullName;
//    }
//    public void setDob(LocalDate dob) {
//        this.dob = dob;
//    }
    public void setPhoneNum(String phoneNum) {
        this.phoneNum = phoneNum;
    }
    public void setAuthEntity(AuthEntity authEntity) {
        this.authEntity = authEntity;
    }
}
