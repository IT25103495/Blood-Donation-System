package com.b7g2_08.blooddonationsystem.DTOs.Appointment;

import com.b7g2_08.blooddonationsystem.Models.Venue;

public class venueAppointmentDTO {

    private int venueID;
    private String name;
    private String address;

    public venueAppointmentDTO(Venue venue) {

        this.venueID = venue.getVenueID();
        this.name = venue.getName();
        this.address = venue.getAddress();
    }

    public int getVenueID() {
        return venueID;
    }
    public String getName() {
        return name;
    }
    public String getAddress() {
        return address;
    }
}
