package com.b7g2_08.blooddonationsystem.DTOs.Appointment;

import com.b7g2_08.blooddonationsystem.Enums.appStatus;
import com.b7g2_08.blooddonationsystem.Models.Appointment;

import java.time.LocalDate;

public class appointmentResponseDTO {

    private Integer appID;
    private LocalDate date;
    private appStatus status;

    private donorAppointmentDTO donor;
    private campaignAppointmentDTO campaign;
    private venueAppointmentDTO venue;

    public appointmentResponseDTO(Appointment app) {

        this.appID = app.getAppID();
        this.date = app.getDate();
        this.status = app.getStatus();
        this.donor = new donorAppointmentDTO(app.getDonor());
        this.campaign = new campaignAppointmentDTO(app.getCampaign());
        this.venue = new venueAppointmentDTO(app.getVenue());
    }

    public Integer getAppID() {
        return appID;
    }

    public LocalDate getDate() {
        return date;
    }

    public appStatus getStatus() {
        return status;
    }

    public donorAppointmentDTO getDonor() {
        return donor;
    }

    public campaignAppointmentDTO getCampaign() {
        return campaign;
    }

    public venueAppointmentDTO getVenue() {
        return venue;
    }
}
