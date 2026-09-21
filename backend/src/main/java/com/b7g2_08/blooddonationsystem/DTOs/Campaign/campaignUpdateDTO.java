package com.b7g2_08.blooddonationsystem.DTOs.Campaign;

import com.b7g2_08.blooddonationsystem.Enums.campStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.Set;

public class campaignUpdateDTO {

    @NotBlank(message = "name is required")
    @Size(max = 255)
    protected String name;
    @NotNull(message = "startDate is required")
    protected LocalDate startDate;
    @NotNull(message = "endDate is required")
    protected LocalDate endDate;
    @NotNull(message = "hosterID is required")
    protected Integer hosterID;
    @NotEmpty(message = "at least one venue is required")
    protected Set<@NotNull Integer> venueIDs;
    @NotNull(message = "status is required")
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
