package com.b7g2_08.blooddonationsystem.DTOs.Request;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public class requestCreateDTO {
    @NotNull(message = "quantities is required")
    @Size(min = 8, max = 8, message = "quantities must have one entry per blood type (8)")
    protected List<@NotNull @PositiveOrZero Integer> quantities;

    @NotNull(message = "deadline is required")
    @FutureOrPresent(message = "deadline cannot be in the past")
    protected LocalDate deadline;



    public List<Integer> getQuantities() {
        return quantities;
    }

    public LocalDate getDeadline() {
        return deadline;
    }


}
