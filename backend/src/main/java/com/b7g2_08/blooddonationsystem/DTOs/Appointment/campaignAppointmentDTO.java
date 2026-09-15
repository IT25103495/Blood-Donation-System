package com.b7g2_08.blooddonationsystem.DTOs.Appointment;

import com.b7g2_08.blooddonationsystem.Models.Campaign;

import java.time.LocalDate;

public class campaignAppointmentDTO {

    private int campID;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;

    public campaignAppointmentDTO(Campaign camp) {

        this.campID = camp.getCampID();
        this.name = camp.getName();
        this.startDate = camp.getStartDate();
        this.endDate = camp.getEndDate();
    }

    public int getCampID() {
        return campID;
    }

    public String getName() {
        return name;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }
}
