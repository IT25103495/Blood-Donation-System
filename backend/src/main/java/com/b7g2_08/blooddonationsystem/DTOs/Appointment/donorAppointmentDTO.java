package com.b7g2_08.blooddonationsystem.DTOs.Appointment;

import com.b7g2_08.blooddonationsystem.Models.Users.Donor;
import com.fasterxml.jackson.annotation.JsonProperty;

public class donorAppointmentDTO {

    private int donorID;
    private String fName;
    private String lName;
    private String bloodType;
    private String phoneNum;

    public donorAppointmentDTO(Donor donor) {
        this.donorID = donor.getID();
        this.fName = donor.getF_Name();
        this.lName = donor.getL_Name();
        this.bloodType = donor.getBloodType();
        this.phoneNum = donor.getPhoneNum();
    }

    public int getDonorID() {
        return donorID;
    }

    // getfName()/getlName() are not valid bean getters - the character after "get" has to be upper
    // case - so Jackson skipped them and every appointment response came back with no donor name.
    // The name is pinned with @JsonProperty so it no longer depends on how the getter is spelled.
    @JsonProperty("fName")
    public String getFirstName() {
        return fName;
    }

    @JsonProperty("lName")
    public String getLastName() {
        return lName;
    }

    public String getBloodType() {
        return bloodType;
    }

    // Staff need a way to reach the donor about a booking they have to confirm, move, or chase up.
    public String getPhoneNum() {
        return phoneNum;
    }
}
