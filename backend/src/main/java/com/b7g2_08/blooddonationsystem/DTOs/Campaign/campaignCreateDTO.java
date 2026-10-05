package com.b7g2_08.blooddonationsystem.DTOs.Campaign;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.Set;

public class campaignCreateDTO {

    @NotBlank(message = "name is required")
    @Size(max = 255)
    protected String name;
    @NotNull(message = "startDate is required")
    @FutureOrPresent(message = "startDate cannot be in the past")
    protected LocalDate startDate;
    @NotNull(message = "endDate is required")
    protected LocalDate endDate;
    // A campaign has to run somewhere, so it is created with at least one venue. More can be added,
    // and these ones swapped out, from the campaign's own page afterwards.
    @NotEmpty(message = "at least one venue is required")
    protected Set<@NotNull Integer> venueIDs;
    // Only read when an admin creates the campaign; a hoster always creates for itself.
    protected Integer hosterID;

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

    public Set<Integer> getVenueIDs() {
        return venueIDs;
    }

    public Integer getHosterID() {
        return hosterID;
    }
}
