package com.b7g2_08.blooddonationsystem.DTOs.Appointment;

import com.b7g2_08.blooddonationsystem.Enums.appStatus;

import java.time.LocalDate;

public class appointmentUpdateDTO {

    protected appStatus status;
    protected LocalDate date;
    protected Integer campId;
    protected Integer donorID;
    protected Integer venueID;

    public appStatus getStatus() {
        return status;
    }

    public LocalDate getDate() {
        return date;
    }

    public Integer getCampId() {
        return campId;
    }

    public Integer getDonorID() {
        return donorID;
    }

    public Integer getVenueID() {
        return venueID;
    }
}
