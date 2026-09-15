package com.b7g2_08.blooddonationsystem.DTOs.Appointment;

import com.b7g2_08.blooddonationsystem.Models.Users.Donor;

public class donorAppointmentDTO {

    private int donorID;
    private String fName;
    private String lName;
    private String bloodType;

    public donorAppointmentDTO(Donor donor) {
        this.donorID = donor.getID();
        this.fName = donor.getF_Name();
        this.lName = donor.getL_Name();
        this.bloodType = donor.getBloodType();

    }

    public int getDonorID() {
        return donorID;
    }

    public String getfName() {
        return fName;
    }

    public String getlName() {
        return lName;
    }

    public String getBloodType() {
        return bloodType;
    }
}
