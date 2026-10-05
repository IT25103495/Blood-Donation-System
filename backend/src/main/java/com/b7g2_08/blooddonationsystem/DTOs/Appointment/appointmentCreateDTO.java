package com.b7g2_08.blooddonationsystem.DTOs.Appointment;

import java.time.LocalDate;

public class appointmentCreateDTO {

    protected LocalDate date;
    protected Integer campId;
    protected Integer donorID;
    protected Integer venueID;

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
