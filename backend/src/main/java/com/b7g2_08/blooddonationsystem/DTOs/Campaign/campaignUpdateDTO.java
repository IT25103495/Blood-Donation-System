package com.b7g2_08.blooddonationsystem.DTOs.Campaign;

import com.b7g2_08.blooddonationsystem.Enums.campStatus;

import java.time.LocalDate;
import java.util.Set;

public class campaignUpdateDTO {

    protected String name;
    protected LocalDate startDate;
    protected LocalDate endDate;
    protected Integer hosterID;
    protected Set<Integer> venueIDs;
    protected campStatus status;

    public String getName() {
        return name;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public Integer getHosterID() {
        return hosterID;
    }

    public Set<Integer> getVenueIDs() {
        return venueIDs;
    }

    public campStatus getStatus() { return status; }
}
