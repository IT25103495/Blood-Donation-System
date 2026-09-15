package com.b7g2_08.blooddonationsystem.DTOs.Appointment;

import java.time.LocalDate;

public class appointmentCreateDTO {

    protected LocalDate date;
    protected int campId;
    protected int donorID;
    protected int venueID;

    public LocalDate getDate() {
        return date;
    }

    public int getCampId() {
        return campId;
    }

    public int getDonorID() {
        return donorID;
    }

    public int getVenueID() {
        return venueID;
    }

}
