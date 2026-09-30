package com.b7g2_08.blooddonationsystem.DTOs.Campaign;

import com.b7g2_08.blooddonationsystem.Enums.campStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.Set;

// Partial update: any field left out (null) keeps the campaign's current value.
public class campaignUpdateDTO {

    @Size(max = 255)
    protected String name;
    protected LocalDate startDate;
    protected LocalDate endDate;
    protected Integer hosterID;
    protected Set<@NotNull Integer> venueIDs;
    protected campStatus status;

    @AssertTrue(message = "endDate must not be before startDate")
    private boolean isDateRangeValid() {
        return startDate == null || endDate == null || !endDate.isBefore(startDate);
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

    public Integer getHosterID() {
        return hosterID;
    }

    public Set<Integer> getVenueIDs() {
        return venueIDs;
    }

    public campStatus getStatus() { return status; }
}
